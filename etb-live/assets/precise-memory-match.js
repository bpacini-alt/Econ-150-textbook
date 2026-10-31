/* Precise Practice reusable Memory Match engine, v0.1 prototype.
 * Input: pairs of [term, definition]; mount(host,pairs,{onComplete}).
 * Buttons support keyboard and pointer. No audio, no accounts, no scores.
 */
(function(root){"use strict";
const escapeHTML=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuffle=arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function mount(host,pairs,options){
 if(!host||!Array.isArray(pairs)||pairs.length<2)throw new Error("Memory Match needs at least two term/meaning pairs");
 const opt=options||{};
 const chosen=pairs.slice(0,6);
 const tiles=shuffle(chosen.flatMap((p,i)=>[{id:i+"-term",pair:i,text:p[0]},{id:i+"-meaning",pair:i,text:p[1]}]));
 let picked=[],matched=new Set(),busy=false,turns=0,finished=false,timeout=null;
 function draw(){
  let h='<div class="ppm-head"><b>Memory Match</b><span>'+matched.size+' / '+chosen.length+' pairs found</span></div>';
  h+='<p class="ppm-help">Choose a word, then its meaning. Tap a selected card again to unselect. Matches turn green and disappear.</p>';
  h+='<div class="ppm-grid" role="group" aria-label="Match terms to definitions">'+tiles.map(t=>{
   if(matched.has(t.pair))return '<span class="ppm-empty" aria-hidden="true"></span>';
   const active=picked.includes(t.id),success=busy&&picked.length===2&&tiles.filter(x=>picked.includes(x.id)).every(x=>x.pair===t.pair);
   return '<button class="ppm-tile '+(active?'ppm-picked ':'')+(success?'ppm-success':'')+'" type="button" data-tile="'+t.id+'" aria-pressed="'+active+'" '+(busy?'disabled':'')+'>'+escapeHTML(t.text)+'</button>';
  }).join('')+'</div>';
  h+='<p class="ppm-status" role="status" aria-live="polite">'+(finished?'All pairs matched. You can move on or try another board.':busy?'A match!':picked.length?'Choose the matching card.':'Find all '+chosen.length+' pairs at your own pace.')+'</p>';
  if(finished)h+='<button type="button" class="ppm-again" data-memory-again>Play another round</button>';
  host.innerHTML=h;
  host.querySelectorAll('[data-tile]').forEach(b=>b.onclick=()=>choose(b.dataset.tile));
  const restart=host.querySelector('[data-memory-again]');if(restart)restart.onclick=()=>{if(opt.onAgain)opt.onAgain();else mount(host,shuffle(pairs),opt)};
 }
 function choose(id){
  if(busy||finished)return;
  if(picked.includes(id)){picked=picked.filter(x=>x!==id);draw();return;}
  const t=tiles.find(x=>x.id===id);
  if(!t||matched.has(t.pair))return;
  picked.push(id);
  if(picked.length===1){draw();return}
  turns++;
  const pairA=tiles.find(x=>x.id===picked[0]),right=pairA.pair===t.pair;
  busy=true;draw();
  timeout=setTimeout(()=>{
    if(right)matched.add(t.pair);
    picked=[];busy=false;
    if(matched.size===chosen.length&&!finished){finished=true;if(typeof opt.onComplete==="function")opt.onComplete({pairs:chosen.length,turns})}
    draw();
  },right?680:850);
 }
 draw();
 return {destroy(){if(timeout!==null)clearTimeout(timeout);host.innerHTML=""}};
}
root.PreciseMemoryMatch={mount};
})(window);
