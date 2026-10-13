require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 4242);
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey.startsWith("sk_") && !stripeKey.includes("REPLACE_ME")
  ? new Stripe(stripeKey) : null;

const db = new Database(path.join(__dirname, "mindmystery.sqlite"));
db.exec(`
  CREATE TABLE IF NOT EXISTS purchases (
    session_id TEXT PRIMARY KEY,
    email TEXT,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    certificate_number TEXT UNIQUE
  );
  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function makeCertificateNumber() {
  for (let i = 0; i < 100; i++) {
    const n = String(crypto.randomInt(10000, 100000));
    const exists = db.prepare("SELECT 1 FROM purchases WHERE certificate_number = ?").get(n);
    if (!exists) return n;
  }
  throw new Error("Could not allocate a unique certificate number");
}

// Stripe webhook must receive the raw body for signature verification.
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes("REPLACE_ME")) {
    return res.status(503).send("Stripe webhook is not configured.");
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const score = Number(session.metadata?.challenge_score);
    if (session.payment_status === "paid" && Number.isInteger(score) && score >= 0 && score <= 18) {
      const cert = makeCertificateNumber();
      try {
        db.prepare("INSERT OR IGNORE INTO purchases (session_id,email,score,created_at,certificate_number) VALUES (?,?,?,?,?)")
          .run(session.id, session.customer_details?.email || "", score, new Date().toISOString(), cert);
        db.prepare("INSERT INTO activity (event,created_at) VALUES (?,?)")
          .run("report_purchased", new Date().toISOString());
      } catch (e) {
        console.error("Purchase persistence failed:", e.message);
      }
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/create-checkout-session", async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Payments are not configured yet. Add Stripe test keys to .env." });
  const score = Number(req.body.score);
  if (!Number.isInteger(score) || score < 0 || score > 18) return res.status(400).json({ error: "Invalid challenge score." });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "aud",
          product_data: { name: "MindMystery Detailed Challenge Report", description: "Challenge score, answer explanations and completion certificate. Not a clinical IQ assessment." },
          unit_amount: 199
        },
        quantity: 1
      }],
      success_url: `${BASE_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/?payment=cancelled`,
      metadata: { challenge_score: String(score) },
      billing_address_collection: "auto"
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ error: "Could not create checkout session. Please try again." });
  }
});

app.get("/api/report/:sessionId", (req, res) => {
  const row = db.prepare("SELECT session_id, score, created_at, certificate_number FROM purchases WHERE session_id = ?").get(req.params.sessionId);
  if (!row) return res.status(404).json({ error: "Paid report not found yet. If you have paid, wait a moment and refresh." });
  res.json({
    reportType: "Reasoning challenge report",
    score: row.score,
    maxScore: 18,
    certificateNumber: row.certificate_number,
    issuedAt: row.created_at,
    note: "This is a challenge-performance report, not a validated IQ score or accredited qualification."
  });
});

app.get("/api/activity", (req, res) => {
  // Only real purchase events are exposed. No fabricated names, photos, IQ scores or countries.
  const rows = db.prepare("SELECT event, created_at FROM activity ORDER BY id DESC LIMIT 5").all();
  res.json({ items: rows });
});

app.listen(PORT, () => {
  console.log(`MindMystery running at ${BASE_URL}`);
  if (!stripe) console.log("Payments are disabled until Stripe keys are configured in .env.");
});
