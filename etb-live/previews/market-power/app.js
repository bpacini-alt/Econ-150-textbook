/* Preview orchestration only. Shared engines are copied without modifications.
 * Graph classification delegates scoring, keys, balancing, and review to quick.js.
 * Revenue entries use the existing Calculation Lab parser and calc event contract.
 */
(function () {
  "use strict";
  const {esc} = PP.util;
  const data = window.MP_DATA;
  PP.configureData(data);
  const graphHost = document.getElementById("graph-activity");
  const revenueHost = document.getElementById("revenue-activity");
  const attempts = {}, shown = {};
  const graphState = {};
  let cleanup = null, active = "";
  let sale = {model:"monopoly", step:0, phase:0, graphOpen:false, tableOpen:false};
  const activity = {id:"mp-graph-recognition", type:"quick", tier:1, labels:["Monopoly firm","Price-taking firm"], round_size:8, items:data.graphs};
  const dollars = n => (n<0?"−$":"$")+Math.abs(n);
  const change = n => n>0?"+$"+n:n<0?"−$"+Math.abs(n):"$0";

  function record(unit, fields, act, type, tier, since) {
    const attempt = attempts[unit.id] = (attempts[unit.id]||0)+1;
    PP.recordEvent({concept:act===activity.id?1:2,act,type,tier,mode:"chosen",unit:unit.id,unit_v:unit._v,attempt,
      ms:Math.round(performance.now()-since),correct:!!fields.correct,resp:fields.resp||{},
      misc:(fields.misc||[]).filter(Boolean),extra:fields.extra});
  }

  function fallback(figure) {
    return '<details class="mp-graph-fallback"><summary>Graph description</summary><p>'+esc(figure.alt)+"</p></details>";
  }

  function graphMarkup(item, small) {
    return '<div class="'+(small?"mp-review-figure":"mp-stimulus")+'">'+PP.figure(item.figure)+fallback(item.figure)+"</div>";
  }

  function mountGraphs() {
    const resize = () => {
      if (!graphState.done) {
        const item = activity.items[graphState.round[graphState.pos]];
        const stage = graphHost.querySelector(".pp-quick-stage");
        if (stage && !stage.querySelector(".mp-stimulus")) {
          stage.innerHTML = '<div class="pp-prompt">'+esc(item.prompt)+"</div>"+graphMarkup(item,false);
        }
      } else {
        // Keep each graph beside its feedback in both missed and full reviews.
        const missedRows = Array.from(graphHost.children).filter(el=>el.classList.contains("pp-result"));
        missedRows.forEach((el,i)=>{
          if (!el.querySelector(".mp-review-figure")) el.insertAdjacentHTML("beforeend",graphMarkup(activity.items[graphState.missed[i]],true));
        });
        graphHost.querySelectorAll(".ppq-items > li").forEach((el,i)=>{
          if (!el.querySelector(".mp-review-figure")) el.insertAdjacentHTML("beforeend",graphMarkup(activity.items[graphState.round[i]],true));
        });
      }
    };
    cleanup = PP.renderers.quick.render(graphHost, activity, {
      state:graphState,save(){},count(){},roundDone(){return false;},resized:resize,
      shown(key){shown[key]=performance.now();},
      record(unit,fields){record(unit,fields,activity.id,"quick",1,shown[fields.key]||performance.now());}
    });
  }

  document.getElementById("model-examples").innerHTML = data.examples.map(f=>PP.figure(f)).join("");

  function currentSale(){return data.sales[sale.model][sale.step];}
  function prepareSale(){
    sale.phase=0;sale.graphOpen=false;sale.tableOpen=false;
    sale.entries=Array.from({length:3},()=>({raw:'',correct:false,feedback:'',hint:false,shownAt:performance.now()}));
  }

  function ticketStrip(row, alternative) {
    const showChanges=alternative && sale.entries[0].correct;
    const cut=row.oldp-row.newp;
    return '<div class="mr-tickets" aria-label="'+(alternative?'Tickets at the alternative price':'Tickets at the starting price')+'">'+
      Array.from({length:row.q},(_,i)=>{
        const extra=i===row.q-1;
        if(extra && !alternative)return '<div class="mr-ticket mr-no-sale"><span>Extra buyer</span><b>No purchase</b></div>';
        const revealLoss=sale.entries[1].correct;
        const difference=showChanges?(extra?'Adds '+dollars(row.gain):revealLoss?(cut?'Brings '+dollars(cut)+' less':'Same revenue'):''):'';
        const cls=showChanges?(extra?' mr-add':sale.entries[1].correct&&cut?' mr-subtract':''):'';
        return '<div class="mr-ticket'+cls+'"><span>'+(extra?'Extra buyer':'Buyer '+(i+1))+'</span><b>'+dollars(alternative?row.newp:row.oldp)+'</b>'+
          (showChanges?'<small>'+difference+'</small>':'')+'</div>';
      }).join('')+'</div>';
  }

  function offerCard(row,alternative) {
    const quantity=alternative?row.q:row.q-1,price=alternative?row.newp:row.oldp;
    return '<section class="mr-offer'+(alternative?' mr-alternative':'')+'" aria-labelledby="offer-'+(alternative?'b':'a')+'">'+
      '<h4 id="offer-'+(alternative?'b':'a')+'">'+(alternative?'Offer B':'Offer A')+'</h4>'+
      '<div class="mr-price">'+dollars(price)+'<span>per ticket</span></div>'+
      '<p class="mr-quantity">'+quantity+' buyer'+(quantity===1?'':'s')+'</p>'+ticketStrip(row,alternative)+
      '<div class="mr-total"><span>Total revenue</span><strong>'+(alternative&&!sale.entries[2].correct?'?':dollars(alternative?row.after:row.before))+'</strong><small>'+quantity+' × '+dollars(price)+'</small></div></section>';
  }

  function revenueGraph(row) {
    const mono=sale.model==="monopoly",q=row.q,price=row.newp;
    // MR at an interval's midpoint matches the exact continuous MR line for
    // linear demand. Horizontal bars span each whole-unit sale interval.
    // The bar from Q=1 to Q=2 is at $8; the curve's value at Q=2 is $7.
    // Thus the discrete revenue arithmetic is never presented as a point at Q=2.
    const points=[],lines=[{points:[[0,0],[8,0]],label:"$0",label_at:[0,0],label_dx:-7,label_dy:4,label_anchor:"end",role:"neutral",style:"dotted"},{points:mono?[[0,11],[8,3]]:[[0,10],[8,10]],label:mono?"D (price)":"D = MR",role:"demand",label_at:[6.7,mono?4.3:10]}];
    const rows=data.sales[sale.model].slice(0,sale.step+1);
    rows.forEach((r,i)=>{
      const latest=i===rows.length-1;
      lines.push({points:[[r.q-1,r.mr],[r.q,r.mr]],role:"mark",style:"dotted",label:latest?"MR = "+dollars(r.mr):"",label_at:[r.q-.5,r.mr],label_dx:0,label_dy:r.mr<0?-14:22,label_anchor:"middle"});
      points.push({at:[r.q-.5,r.mr]});
    });
    points.push({at:[q,price]});
    const fig={kind:"graph",alt:(mono?"Demand price falls by one dollar with each additional unit.":"The firm's demand price stays at ten dollars.")+" The latest sale goes from "+(q-1)+" to "+q+" units; price is "+dollars(price)+" per unit and marginal revenue for that whole-unit change is "+dollars(row.mr)+". Purple dotted bars show marginal revenue for completed sale intervals.",x:{label:"Firm quantity",max:8.5},y:{label:"$ per unit",min:-3,max:13},lines,points,guides:[{at:[q,price],x_label:String(q),y_label:dollars(price)}]};
    return '<div class="mp-chart">'+PP.figure(fig)+"</div>"+
      '<p class="mp-graph-note">Blue: price on demand. Purple dotted bars: MR over each whole-unit sale. Each bar spans the unit it adds. The dot sits at the interval\u2019s midpoint.</p>';
  }

  function revenueTable(row) {
    const rows=[{q:1,newp:10,after:10,mr:10},...data.sales[sale.model].slice(0,sale.step+1)];
    return '<table class="mp-table"><caption class="pp-sr">Completed sales and total revenue</caption><thead><tr><th scope="col">Units</th><th scope="col">Price</th><th scope="col">Total revenue</th><th scope="col">MR</th></tr></thead><tbody>'+rows.map(r=>'<tr><th scope="row">'+r.q+"</th><td>"+dollars(r.newp)+"</td><td>"+dollars(r.after)+"</td><td>"+change(r.mr)+"</td></tr>").join("")+"</tbody></table>";
  }

  function questionPanel(row) {
    const task=row.tasks[sale.phase],entry=sale.entries[sale.phase];
    const done=entry.correct;
    const last=sale.step===data.sales[sale.model].length-1;
    let h='<form class="mr-question" id="sale-question" novalidate><h3 id="mr-question-label">'+esc(task.prompt)+'</h3>';
    h+='<p id="mr-input-help">'+(sale.phase===1?'Enter the amount lost as a positive number.':sale.phase===2?'Enter the change in revenue. Use a minus sign if revenue falls.':'Use the ticket prices below.')+'</p>';
    h+='<div class="mr-entry-row"><div class="mr-input-wrap"><span aria-hidden="true">$</span><input id="mr-answer" type="text" inputmode="'+(sale.phase===2?'text':'decimal')+'" autocomplete="off" spellcheck="false" maxlength="24" aria-labelledby="mr-question-label" aria-describedby="mr-input-help mr-answer-feedback" aria-invalid="'+(!done&&entry.feedback?'true':'false')+'" value="'+esc(entry.raw)+'"'+(done?' disabled':'')+'></div>';
    if(!done)h+='<button type="submit" class="pp-primary">Check answer</button>';
    else if(sale.phase<2)h+='<button type="button" class="pp-primary" id="sale-continue">Next question →</button>';
    else h+='<button type="button" class="pp-primary" id="'+(last?'sale-reset':'sale-next')+'">'+(last?'Start with 1 → 2 tickets':'Try '+row.q+' → '+(row.q+1)+' tickets')+'</button>';
    h+='</div><div id="mr-answer-feedback" class="'+(entry.feedback?'pp-feedback'+(done?'':' pp-bad'):'')+'" role="status" aria-live="polite">'+esc(entry.feedback)+'</div>';
    if(!done)h+='<details class="mr-hint" id="mr-hint"'+(entry.hint?' open':'')+'><summary>Need a hint?</summary><p>'+esc(task.hint)+'</p></details>';
    if(sale.phase>0)h+='<button type="button" class="pp-link mr-back" id="sale-back">Back one question</button>';
    return h+'</form>';
  }

  function checkAnswer() {
    const row=currentSale(),task=row.tasks[sale.phase],entry=sale.entries[sale.phase];
    if(entry.correct)return;
    const value=PP.util.parseNumber(entry.raw);
    if(!Number.isFinite(value)){
      entry.feedback='Enter a number, such as 8 or −2.';
      drawSale();focusAnswer(true);return;
    }
    const correct=Math.abs(value-task.answer)<1e-9;
    const error=(task.common_errors||[]).find(e=>Math.abs(value-e.value)<1e-9);
    entry.correct=correct;
    entry.feedback=correct?'Correct. '+task.why:error?error.feedback:'Try again. '+task.hint;
    record(task,{correct,resp:{raw:PP.clip(entry.raw,24),value,cls:null,error:error?error.label:null},misc:[error?error.misconception:null],
      extra:{stage:1,supports:{formula:false,hints:entry.hint,example:false},sequence_step:sale.phase+1,model:sale.model,from_quantity:row.q-1,to_quantity:row.q}},
      'mp-revenue-calculation','calc',2,entry.shownAt);
    drawSale();
    if(correct)focusAction();else focusAnswer(true);
  }

  function drawSale() {
    const r=currentSale(),mono=sale.model==='monopoly';
    const complete=sale.entries[2].correct;
    const labels=['Extra buyer','Other tickets','Marginal revenue'];
    const explanation=mono?
      'At '+dollars(r.oldp)+', '+(r.q-1)+' '+(r.q===2?'person buys':'people buy')+'. At '+dollars(r.newp)+', '+r.q+' people buy. Everyone pays the same price.':
      'This price-taking seller can sell another ticket at the same '+dollars(r.newp)+' market price.';
    let h='<p class="mr-model">'+(mono?'Single-price monopoly':'Price-taking firm')+'</p>';
    h+='<ol class="mr-steps" aria-label="Questions">'+labels.map((label,i)=>'<li'+(i===sale.phase?' aria-current="step"':'')+'><span>'+(i+1)+'</span>'+label+'</li>').join('')+'</ol>';
    h+=questionPanel(r);
    h+='<p class="mr-evidence-intro">'+explanation+'</p>';
    if(sale.phase>0)h+='<div class="mr-known" aria-label="Your checked answers"><span>Extra buyer: <strong>'+change(r.gain)+'</strong></span>'+
      (sale.phase>1?'<span>Lost on other tickets: <strong>'+dollars(r.loss)+'</strong></span>':'')+'</div>';
    h+='<div class="mr-offers">'+offerCard(r,false)+offerCard(r,true)+'</div>';
    if(complete && sale.phase===2){
      h+='<div class="mr-result"><p>Marginal revenue = change in total revenue</p><div class="mr-subtraction">'+dollars(r.after)+' <span>−</span> '+dollars(r.before)+' <span>=</span> <strong>'+change(r.mr)+'</strong></div></div>';
      h+='<div class="mr-distinction"><div><span>Price of each ticket</span><strong>'+dollars(r.newp)+'</strong></div><div><span>Extra revenue from one more ticket</span><strong>'+change(r.mr)+'</strong><small>Marginal revenue</small></div></div>';
      h+='<p class="mr-meaning">'+(mono?(r.mr<0?'The price cut costs more revenue than the extra buyer brings in.':r.mr===0?'The extra buyer\u2019s payment exactly offsets the revenue lost to the price cut.':'The extra buyer pays '+dollars(r.newp)+', but total revenue rises by only '+dollars(r.mr)+'.'):'The extra buyer pays '+dollars(r.newp)+', and total revenue rises by '+dollars(r.mr)+'. Here, MR = price.')+'</p>';
      h+='<div class="mr-followups"><button type="button" class="pp-link" id="sale-switch">'+(mono?'Compare with a price-taking firm':'Return to the monopoly')+'</button><button type="button" class="pp-link" id="sale-replay">Try this example again</button></div>';
      h+='<details class="mp-support" id="sale-graph"'+(sale.graphOpen?' open':'')+'><summary>Connect it to a graph</summary>'+revenueGraph(r)+'</details>';
      h+='<details class="mp-support" id="sale-table"'+(sale.tableOpen?' open':'')+'><summary>See the revenue table</summary>'+revenueTable(r)+'</details>';
    }
    revenueHost.innerHTML=h;
    const input=revenueHost.querySelector('#mr-answer');
    input.oninput=()=>{sale.entries[sale.phase].raw=input.value;};
    revenueHost.querySelector('#sale-question').onsubmit=e=>{e.preventDefault();checkAnswer();};
    const hint=revenueHost.querySelector('#mr-hint');
    if(hint)hint.ontoggle=()=>{sale.entries[sale.phase].hint=hint.open;};
    const actions={
      'sale-continue':()=>{sale.phase++;drawSale();focusAnswer();},
      'sale-back':()=>{sale.phase--;drawSale();focusAction();},
      'sale-next':()=>{sale.step++;prepareSale();drawSale();focusAnswer();},
      'sale-reset':()=>{sale.step=0;prepareSale();drawSale();focusAnswer();},
      'sale-replay':()=>{prepareSale();drawSale();focusAnswer();},
      'sale-switch':()=>{sale.model=mono?'competitive':'monopoly';prepareSale();drawSale();focusAnswer();}
    };
    for(const [id,action] of Object.entries(actions)){const button=revenueHost.querySelector('#'+id);if(button)button.onclick=action;}
    for(const [id,key] of [['sale-graph','graphOpen'],['sale-table','tableOpen']]){
      const d=revenueHost.querySelector('#'+id);if(d)d.ontoggle=()=>{sale[key]=d.open;};
    }
  }

  function focusAnswer(select){
    const input=revenueHost.querySelector('#mr-answer');
    if(input&&!input.disabled){input.focus({preventScroll:true});if(select)input.select();}else focusAction();
  }
  function focusAction(){
    const button=revenueHost.querySelector('.mr-entry-row button');
    if(button)button.focus({preventScroll:true});
  }

  function route(){
    const target=location.hash==="#graphs"?"graphs":location.hash==="#revenue"?"revenue":document.body.dataset.start||"graphs";
    if(target===active)return;
    if(cleanup){cleanup();cleanup=null;}
    active=target;
    for(const key of ["graphs","revenue"]){
      document.getElementById(key).hidden=key!==target;
      const nav=document.getElementById("nav-"+key);
      if(key===target)nav.setAttribute("aria-current","page");else nav.removeAttribute("aria-current");
    }
    if(target==="graphs")mountGraphs();else drawSale();
  }
  prepareSale();
  window.addEventListener("hashchange",route);
  route();
  // Read-only state for repeatable browser QA of the two prototypes.
  window.MP_PREVIEW={get graphState(){return graphState;},get sale(){return {...sale};}};
})();
