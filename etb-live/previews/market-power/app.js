/* Preview orchestration only. Shared engines are copied without modifications.
 * Graph classification delegates scoring, keys, balancing, and review to quick.js.
 * Revenue predictions use the existing choice event contract (authored indices).
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
  function prepareSale(){sale.phase=0;sale.graphOpen=false;sale.tableOpen=false;}

  function ticketStrip(row, alternative) {
    const showChanges=alternative && sale.phase>=1;
    const cut=row.oldp-row.newp;
    return '<div class="mr-tickets" aria-label="'+(alternative?'Tickets at the alternative price':'Tickets at the starting price')+'">'+
      Array.from({length:row.q},(_,i)=>{
        const extra=i===row.q-1;
        if(extra && !alternative)return '<div class="mr-ticket mr-no-sale"><span>Extra buyer</span><b>No purchase</b></div>';
        const difference=showChanges?(extra?'Adds '+dollars(row.gain):cut?'Brings '+dollars(cut)+' less':'Same revenue'):'';
        const cls=showChanges?(extra?' mr-add':cut?' mr-subtract':''):'';
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
      '<div class="mr-total"><span>Total revenue</span><strong>'+dollars(alternative?row.after:row.before)+'</strong><small>'+quantity+' × '+dollars(price)+'</small></div></section>';
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

  function drawSale() {
    const r=currentSale(),mono=sale.model==='monopoly',last=sale.step===data.sales[sale.model].length-1;
    const cut=r.oldp-r.newp,earlier=r.q-1;
    const labels=['Compare the offers','See both effects','Find marginal revenue'];
    const titles=[mono?'A lower price attracts one more buyer.':'One more buyer at the same price.',
      mono?'The extra buyer adds revenue. The price cut gives some up.':'The extra buyer adds revenue. The price stays the same.',
      r.mr<0?'More tickets, less total revenue.':r.mr===0?'One more ticket adds no net revenue.':'How much extra revenue did the sale add?'];
    const explanation=mono?
      'At '+dollars(r.oldp)+', '+earlier+' '+(earlier===1?'person buys':'people buy')+'. At '+dollars(r.newp)+', '+r.q+' people buy. Everyone pays the same price.':
      'A price-taking seller can sell '+r.q+' tickets at the same '+dollars(r.newp)+' market price.';
    let h='<p class="mr-model">'+(mono?'Single-price monopoly':'Price-taking firm')+'</p>';
    h+='<ol class="mr-steps" aria-label="Walkthrough steps">'+labels.map((label,i)=>'<li'+(i===sale.phase?' aria-current="step"':'')+'><span>'+(i+1)+'</span>'+label+'</li>').join('')+'</ol>';
    h+='<div class="mr-stage-heading" aria-live="polite" aria-atomic="true"><h3>'+titles[sale.phase]+'</h3><p>'+explanation+'</p></div>';
    h+='<div class="mr-offers">'+offerCard(r,false)+offerCard(r,true)+'</div>';
    if(sale.phase===0){
      h+='<p class="mr-rule">'+(mono?'Notice that Offer B charges the lower price for <strong>every ticket</strong>.':'Both offers charge the same price for every ticket.')+'</p>';
    }
    if(sale.phase===1){
      h+='<div class="mr-effects"><div class="mr-effect mr-effect-add"><span>Extra buyer</span><strong>'+change(r.gain)+'</strong><p>The extra ticket brings in '+dollars(r.gain)+'.</p></div>'+
        '<div class="mr-effect mr-effect-subtract"><span>'+(mono?'Price cut for the other '+(earlier===1?'buyer':'buyers'):'Other buyers')+'</span><strong>'+(r.loss?'−'+dollars(r.loss):'$0')+'</strong><p>'+
        (mono?(earlier===1?'The first buyer pays '+dollars(cut)+' less.':earlier+' other buyers each pay '+dollars(cut)+' less.'):'The price stays at '+dollars(r.newp)+', so no revenue is lost.')+'</p></div></div>';
    }
    if(sale.phase===2){
      h+='<div class="mr-result" role="status"><p>Marginal revenue = change in total revenue</p><div class="mr-subtraction">'+dollars(r.after)+' <span>−</span> '+dollars(r.before)+' <span>=</span> <strong>'+change(r.mr)+'</strong></div>'+
        '<p class="mr-mechanism">'+change(r.gain)+' from the extra buyer '+(r.loss?'− '+dollars(r.loss)+' from the price cut':'− $0 lost on the other tickets')+' = '+change(r.mr)+'.</p></div>';
      h+='<div class="mr-distinction"><div><span>Price of each ticket</span><strong>'+dollars(r.newp)+'</strong></div><div><span>Extra revenue from one more ticket</span><strong>'+change(r.mr)+'</strong><small>Marginal revenue</small></div></div>';
      h+='<p class="mr-meaning">'+(mono?(r.mr<0?'The price cut costs more revenue than the extra buyer brings in.':r.mr===0?'The extra buyer\u2019s payment exactly offsets the revenue lost to the price cut.':'The extra buyer pays '+dollars(r.newp)+', but total revenue rises by only '+dollars(r.mr)+'.'):'The extra buyer pays '+dollars(r.newp)+', and total revenue rises by '+dollars(r.mr)+'. Here, MR = price.')+'</p>';
    }
    h+='<div class="pp-actions mr-actions">';
    if(sale.phase<2)h+='<button type="button" class="pp-primary" id="sale-forward">'+(sale.phase===0?'Show the gain and the loss':'Find the extra revenue')+' →</button>';
    else if(!last)h+='<button type="button" class="pp-primary" id="sale-next">Try '+r.q+' → '+(r.q+1)+' tickets</button>';
    else h+='<button type="button" class="pp-primary" id="sale-reset">Start with 1 → 2 tickets</button>';
    if(sale.phase>0)h+='<button type="button" id="sale-back">Back one step</button>';
    h+='</div>';
    if(sale.phase===2){
      h+='<div class="mr-followups"><button type="button" class="pp-link" id="sale-switch">'+(mono?'Compare with a price-taking firm':'Return to the monopoly')+'</button><button type="button" class="pp-link" id="sale-replay">Replay this example</button></div>';
      h+='<details class="mp-support" id="sale-graph"'+(sale.graphOpen?' open':'')+'><summary>Connect it to a graph</summary>'+revenueGraph(r)+'</details>';
      h+='<details class="mp-support" id="sale-table"'+(sale.tableOpen?' open':'')+'><summary>See the revenue table</summary>'+revenueTable(r)+'</details>';
    }
    revenueHost.innerHTML=h;
    const actions={
      'sale-forward':()=>{sale.phase++;drawSale();focusAction();},
      'sale-back':()=>{sale.phase--;drawSale();focusAction();},
      'sale-next':()=>{sale.step++;prepareSale();drawSale();focusAction();},
      'sale-reset':()=>{sale.step=0;prepareSale();drawSale();focusAction();},
      'sale-replay':()=>{prepareSale();drawSale();focusAction();},
      'sale-switch':()=>{sale.model=mono?'competitive':'monopoly';prepareSale();drawSale();focusAction();}
    };
    for(const [id,action] of Object.entries(actions)){const button=revenueHost.querySelector('#'+id);if(button)button.onclick=action;}
    for(const [id,key] of [['sale-graph','graphOpen'],['sale-table','tableOpen']]){
      const d=revenueHost.querySelector('#'+id);if(d)d.ontoggle=()=>{sale[key]=d.open;};
    }
  }

  function focusAction(){
    const button=revenueHost.querySelector('.mr-actions button');
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
