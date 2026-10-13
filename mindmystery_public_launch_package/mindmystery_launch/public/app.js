(() => {
  const $ = id => document.getElementById(id);
  const rounds = [
    {cat:"NUMBER PATTERNS",name:"Round 1 · Pattern Detective",qs:[
      ["2 · 6 · 12 · 20 · ?",["28","30","32","34"],1,"Differences are +4, +6, +8, then +10."],
      ["3 · 9 · 27 · ?",["54","72","81","90"],2,"Each number is multiplied by 3."],
      ["5 · 10 · 20 · 40 · ?",["60","70","80","100"],2,"Each number doubles."]
    ]},
    {cat:"MATH CHALLENGE",name:"Round 2 · Equation Breaker",qs:[
      ["If 4x = 36, what is x + 3?",["9","12","15","18"],1,"x is 9, so x + 3 is 12."],
      ["18 − 2 × 5 = ?",["80","8","40","10"],1,"Multiplication comes first: 18 − 10 = 8."],
      ["If 3x + 7 = 25, what is 2x?",["10","12","14","18"],1,"x = 6, so 2x = 12."]
    ]},
    {cat:"VISUAL & ABSTRACT LOGIC",name:"Round 3 · Spot the Pattern",qs:[
      ["▲ · ■ · ▲▲ · ■■ · ▲▲▲ · ?",["▲▲▲▲","■■■","▲■■","■■■■"],1,"Shapes alternate and the group size increases."],
      ["Which is different?",["Circle","Triangle","Square","Cube"],3,"A cube is three-dimensional; the others are flat."],
      ["A, C, E, G, ?",["H","I","J","K"],1,"The sequence skips one letter each time."]
    ]},
    {cat:"LOGIC TRAPS",name:"Round 4 · Think Twice",qs:[
      ["All Bloops are Razzies. All Razzies are Lazzies. Bloops are…",["All Lazzies","Only Razzies","Never Lazzies","Unknown"],0,"Every Bloop must also be a Lazzie."],
      ["A farmer has 17 sheep. All but 9 run away. How many remain?",["8","9","17","26"],1,"All but 9 means 9 remain."],
      ["Some cats are black. All black things are dark. Which must be true?",["All cats are dark","Some cats are dark","No cats are dark","All dark things are cats"],1,"The black cats are dark, so some cats are dark."]
    ]},
    {cat:"HIDDEN CONNECTIONS",name:"Round 5 · Connect the Clues",qs:[
      ["Which number does not belong?",["16","25","36","45"],3,"16, 25 and 36 are perfect squares; 45 is not."],
      ["Hand is to glove as foot is to…",["Hat","Sock","Sleeve","Belt"],1,"A glove covers a hand; a sock covers a foot."],
      ["Rearrange TAC to name an animal.",["Act","Cat","Cot","Cut"],1,"TAC rearranges to CAT."]
    ]},
    {cat:"FINAL BRAIN TEST",name:"Round 6 · Final Challenge",qs:[
      ["A bat and ball cost $1.10. The bat costs $1 more than the ball. Ball cost?",["5 cents","10 cents","15 cents","20 cents"],0,"The ball costs 5 cents and the bat $1.05."],
      ["Two fathers and two sons catch 3 fish. Each gets one. How?",["One fish is shared","There are 4 people","There are 3 people","Impossible"],2,"There are a grandfather, father and son: three people."],
      ["What comes next? 1 · 1 · 2 · 3 · 5 · 8 · ?",["11","12","13","15"],2,"Each number is the sum of the previous two."]
    ]}
  ];
  let round=0,qi=0,score=0,roundScore=0,left=25,timer=null,answered=false;
  const all=["home","game","intermission","results","report"];
  function show(id){all.forEach(x=>$(x).hidden=x!==id);}
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  function updateProgress(){ $("progress").style.width=((round*3+qi)/18*100)+"%"; $("stage").textContent=`ROUND ${round+1} / 6`; }
  function start(){round=0;qi=0;score=0;roundScore=0;nextQuestion();}
  function nextQuestion(){
    stop();answered=false;const r=rounds[round],q=r.qs[qi];left=25;updateProgress();
    $("category").textContent=r.cat;$("roundName").textContent=r.name;$("questionCount").textContent=`Question ${qi+1} of 3`;
    $("question").textContent=q[0];$("hint").textContent="Choose the best answer. Watch the timer.";
    $("timer").textContent=left+"s";$("timeProgress").style.width="100%";$("feedback").textContent="";$("next").hidden=true;$("options").replaceChildren();
    q[1].forEach((v,i)=>{const b=document.createElement("button");b.className="option";b.type="button";b.textContent=String.fromCharCode(65+i)+". "+v;b.addEventListener("click",()=>answer(i,false));$("options").appendChild(b);});
    show("game");timer=setInterval(()=>{left--;$("timer").textContent=left+"s";$("timeProgress").style.width=(left/25*100)+"%";if(left<=0)answer(-1,true);},1000);
  }
  function answer(choice,timeout){
    if(answered)return;answered=true;stop();const q=rounds[round].qs[qi],ok=choice===q[2];
    if(ok){score++;roundScore++;}
    [...$("options").children].forEach((b,i)=>{b.disabled=true;if(i===q[2])b.style.borderColor="#b8a5ff";if(i===choice&&!ok)b.style.opacity=".6";});
    $("feedback").textContent=(timeout?"Time is up. ":ok?"Correct! ":"Not quite. ")+q[3];$("next").hidden=false;
    $("next").textContent=qi<2?"NEXT QUESTION →":round<5?"FINISH ROUND →":"VIEW RESULTS →";
  }
  function advance(){
    if(qi<2){qi++;nextQuestion();return;}
    if(round<5){
      const titles=["Great start!","Equations unlocked.","Visual round complete.","You made it through the logic traps.","One final round remains."];
      const messages=["Next up: equations that reward careful thinking.","Switch from equations to visual and letter patterns.","Now read each logic statement carefully.","Try the hidden connection puzzles next.","Finish strong with the final brain challenge."];
      $("breakTitle").textContent=titles[round];$("breakText").textContent=messages[round];$("breakScore").textContent=`Round score: ${roundScore} / 3 correct`;
      $("progress").style.width=((round+1)*3/18*100)+"%";$("stage").textContent="ROUND COMPLETE";round++;qi=0;roundScore=0;show("intermission");
    }else showResults();
  }
  async function loadActivity(){
    const target=$("activityFeed");target.textContent="No recent purchases yet.";
    try{const r=await fetch("/api/activity");if(!r.ok)return;const data=await r.json();if(!data.items.length)return;target.replaceChildren();data.items.forEach(item=>{const p=document.createElement("p");p.textContent="A customer purchased a report · "+new Date(item.created_at).toLocaleDateString();target.appendChild(p);});}catch(_){}
  }
  function showResults(){
    stop();$("progress").style.width="100%";$("stage").textContent="COMPLETE";show("results");loadActivity();
    const params=new URLSearchParams(location.search);
    if(params.get("payment")==="success"&&params.get("session_id"))checkReport(params.get("session_id"));
    else if(params.get("payment")==="cancelled")$("payNote").textContent="Payment cancelled. You have not been charged.";
  }
  async function checkReport(sessionId){
    $("payNote").textContent="Checking your payment securely…";
    try{
      const r=await fetch("/api/report/"+encodeURIComponent(sessionId));const data=await r.json();
      if(!r.ok){$("payNote").textContent=data.error||"Report not ready yet. Refresh in a moment.";return;}
      $("certificateNumber").textContent=data.certificateNumber;$("certificateScore").textContent=`Challenge score: ${data.score} / ${data.maxScore}`;$("payNote").textContent="Payment confirmed. Your completion certificate is ready.";$("unlock").textContent="VIEW MY CERTIFICATE";$("unlock").onclick=()=>show("report");
    }catch(_){$("payNote").textContent="Could not check the report. Please refresh and try again.";}
  }
  $("start").addEventListener("click",start);$("next").addEventListener("click",advance);$("nextRound").addEventListener("click",nextQuestion);
  $("unlock").addEventListener("click",async()=>{
    $("payNote").textContent="Opening secure checkout…";$("unlock").disabled=true;
    try{const response=await fetch("/api/create-checkout-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({score})});const data=await response.json();if(!response.ok||!data.url)throw new Error(data.error||"Checkout is unavailable.");location.href=data.url;}
    catch(e){$("payNote").textContent=e.message;$("unlock").disabled=false;}
  });
  $("restart").addEventListener("click",()=>{stop();show("home");$("stage").textContent="READY";$("progress").style.width="0%";$("payNote").textContent="Secure checkout will open when payments are configured."; $("unlock").disabled=false;$("unlock").textContent="UNLOCK MY REPORT — A$1.99";});
  $("backResults").addEventListener("click",()=>show("results"));
  $("year").textContent=new Date().getFullYear();
  if(new URLSearchParams(location.search).get("payment")==="success"){
    showResults();
  }
})();