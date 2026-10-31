/* Precise Practice prototype: shared mixed-and-spiral readiness flow. No gradebook, no mastery certification. */
(function(root){"use strict";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function mount(el,config){
 if(!el||!config.current.length||!config.prior.length)throw Error("Readiness requires current and prior banks");
 const storage="pp-readiness-"+config.book+"-16-v3";
 let state;try{state=JSON.parse(localStorage.getItem(storage))}catch(e){}
 if(!state||state.version!==3)state={version:3,chosen:[config.prior[0].chapter],started:false,streak:0,attempts:0,stage:"question",round:0,cursors:{},pending:null,unlocked:false,done:false};
 const save=()=>{try{localStorage.setItem(storage,JSON.stringify(state))}catch(e){}};
 const selected=()=>config.prior.filter(b=>state.chosen.includes(b.chapter));
 function nextItem(){
  const slot=["current","prior","current","prior","current"][state.streak];
  const banks=slot==="current"?[{chapter:16,items:config.current}]:selected();
  if(!banks.length)return null;
  const group=banks[(state.round+(slot==="prior"?state.streak:0))%banks.length];
  const key=String(group.chapter),idx=state.cursors[key]||0;
  state.cursors[key]=idx+1;
  return {chapter:group.chapter,item:group.items[idx%group.items.length]};
 }
 function render(){
  let h='<div class="pp-ready-head"><strong>Final readiness check</strong><span>5 correct + understood</span></div>';
  h+='<p class="pp-ready-sub">Practice is always optional. To unlock the final reasoning task, mix Chapter 16 with earlier concepts and explain why your answers are right.</p>';
  if(!state.started){
   h+='<details class="pp-ready-select" open><summary>Choose earlier chapters to spiral into your practice</summary><div class="pp-ready-checks">';
   config.prior.forEach(b=>{h+='<label><input type="checkbox" data-ch="'+b.chapter+'" '+(state.chosen.includes(b.chapter)?"checked":"")+'><span>Chapter '+b.chapter+' · '+esc(b.title)+'</span></label>'});
   h+='</div></details><p class="pp-ready-sub">Chapter 16 is always included. At least one earlier chapter is required for the final check. Questions are mixed, not grouped by topic.</p>';
   h+='<button class="pp-ready-main" data-start '+(selected().length?"":"disabled")+'>Start mixed readiness check</button>';
  }else if(state.unlocked){
   h+='<div class="pp-ready-good"><strong>Ready for the final challenge.</strong><p>Five different questions answered correctly, with your own confirmation that you could explain each one. This is encouraging evidence, not proof of mastery.</p></div>';
   h+='<button class="pp-ready-main" data-frq>Go to the final reasoning task</button><button data-again>Practice another mixed round</button>';
  }else{
   h+='<div class="pp-ready-dots" role="img" aria-label="'+state.streak+' of five consecutive correct and understood">'+Array.from({length:5},(_,i)=>'<span class="'+(i<state.streak?"on":"")+'"></span>').join("")+'</div>';
   h+='<p class="pp-ready-sub">'+state.streak+' / 5 · '+state.attempts+' attempts. Wrong or uncertain answers restart the streak.</p>';
   if(!state.pending)state.pending=nextItem();
   const q=state.pending.item;
   h+='<div class="pp-ready-question">'+esc(q.q)+'</div>';
   if(state.stage==="question"){
    if(!state.pending.order){const indices=q.opts.map((_,i)=>i);for(let i=indices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]]}state.pending.order=indices;save()}h+=state.pending.order.map(i=>'<button class="pp-ready-option" data-answer="'+i+'">'+esc(q.opts[i])+'</button>').join("");
   }else{
    h+='<div class="pp-ready-good '+(state.pending.correct?"":"pp-ready-warn")+'"><b>'+(state.pending.correct?"Correct answer.":"Let's correct this one.")+'</b><p>'+esc(q.why)+'</p><p><b>Best answer:</b> '+esc(q.opts[q.a])+'</p></div>';
    if(state.pending.correct){h+='<fieldset class="pp-ready-reflect"><legend>Do you understand why? Could you explain it without looking?</legend><button data-confident="yes">Yes, I could explain it</button><button data-confident="no">Not yet — more practice</button></fieldset>'}
    else h+='<button class="pp-ready-main" data-next>Try another question</button>';
   }
  }
  h+='<p class="pp-ready-sub">Need help? Return to a concept checkpoint or talk with your instructor or a TA. You may keep practicing as long as you need.</p>';
  el.innerHTML=h;
  el.querySelectorAll("[data-ch]").forEach(b=>b.onchange=()=>{const n=Number(b.dataset.ch);state.chosen=b.checked?[...new Set([...state.chosen,n])]:state.chosen.filter(x=>x!==n);save();render()});
  const start=el.querySelector("[data-start]");if(start)start.onclick=()=>{state.started=true;save();render()};
  el.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{if(state.stage!=="question")return;const q=state.pending.item;state.pending.correct=Number(b.dataset.answer)===q.a;state.attempts++;if(!state.pending.correct)state.streak=0;state.stage="feedback";save();render()});
  function advance(understood){if(understood)state.streak++;else state.streak=0;state.round++;state.stage="question";state.pending=null;if(state.streak===5){state.unlocked=true;config.onUnlock&&config.onUnlock()}save();render()}
  const yes=el.querySelector('[data-confident="yes"]');if(yes)yes.onclick=()=>advance(true);
  const no=el.querySelector('[data-confident="no"]');if(no)no.onclick=()=>advance(false);
  const next=el.querySelector("[data-next]");if(next)next.onclick=()=>advance(false);
  const frq=el.querySelector("[data-frq]");if(frq)frq.onclick=()=>{config.onUnlock&&config.onUnlock();config.onGoFRQ&&config.onGoFRQ()};
  const again=el.querySelector("[data-again]");if(again)again.onclick=()=>{state.streak=0;state.unlocked=false;state.stage="question";state.pending=null;state.round++;save();config.onRelock&&config.onRelock();render()};
 }
 render();
 if(state.unlocked&&config.onUnlock)config.onUnlock();
 return {getState:()=>state,render};
}
root.PreciseReadiness={mount};
})(window);
