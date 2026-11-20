/* Preview orchestration only. Shared engines are copied without modifications.
 * Graph classification delegates scoring, keys, balancing, and review to quick.js.
 * Revenue predictions use the existing choice event contract (authored indices).
 */
(function () {
  "use strict";
  const {esc, shuffle} = PP.util;
  const data = window.MP_DATA;
  PP.configureData(data);
  const graphHost = document.getElementById("graph-activity");
  const revenueHost = document.getElementById("revenue-activity");
  const attempts = {}, shown = {};
  const graphState = {};
  let cleanup = null, active = "", saleStart = performance.now();
  let sale = {model:"monopoly", step:0, selected:null, revealed:false, graphOpen:false, tableOpen:false, order:[]};
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
  function prepareSale(){sale.selected=null;sale.revealed=false;sale.order=shuffle([0,1,2]);saleStart=performance.now();}

  function units(row) {
    return '<div class="mp-units" aria-label="Revenue from each unit after the sale">'+Array.from({length:row.q},(_,i)=>{
      const isNew=i===row.q-1,cut=row.oldp-row.newp;
      return '<div class="mp-unit '+(isNew?"mp-new":cut?"mp-repriced":"")+'"><small>'+(isNew?"New unit":"Earlier unit "+(i+1))+"</small><strong>"+dollars(row.newp)+"</strong>"+
        '<small class="'+(isNew?"mp-gain":cut?"mp-loss":"")+'">'+(isNew?"Adds "+dollars(row.gain):cut?"Loses "+dollars(cut):"Same price")+"</small></div>";
    }).join("")+"</div>";
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

  function reveal(row,pick,position) {
    if (sale.revealed) return;
    sale.revealed=true;sale.selected=pick;
    const option=row.options[pick];
    record(row,{correct:option.value===row.mr,resp:{opt:pick,pos:position},misc:[option.tag],extra:{model:sale.model,from_quantity:row.q-1,to_quantity:row.q}},"mp-revenue-prediction","choice",2,saleStart);
    drawSale();
    revenueHost.querySelector("#sale-next, #sale-reset").focus({preventScroll:true});
  }

  function drawSale() {
    const r=currentSale(),mono=sale.model==="monopoly",last=sale.step===data.sales[sale.model].length-1;
    let h='<div class="mp-sale-head"><h3>From '+(r.q-1)+" to "+r.q+' units</h3><span>Sale '+(sale.step+1)+" of 6</span></div>";
    h+='<div class="mp-offer"><p><strong>So far:</strong> '+(r.q-1)+" unit"+(r.q>2?"s":"")+" at "+dollars(r.oldp)+" each = "+dollars(r.before)+" in total revenue.</p><p><strong>Next offer:</strong> "+
      (mono?"Sell "+r.q+" units at "+dollars(r.newp)+" each. The lower price applies to all "+r.q+" units.":"Sell "+r.q+" units at the same market price of "+dollars(r.newp)+" each.")+"</p></div>";
    if (!sale.revealed) {
      h+='<div class="mp-prediction"><h4>How much will total revenue change?</h4><div class="mp-choice-row" role="group" aria-label="Predicted marginal revenue">'+sale.order.map((opt,pos)=>
        '<button type="button" class="pp-choice" data-predict="'+opt+'" data-pos="'+pos+'" aria-pressed="'+(sale.selected===opt)+'">'+change(r.options[opt].value)+"</button>"
      ).join("")+'</div><div class="pp-actions"><button class="pp-primary" type="button" id="sale-check"'+(sale.selected===null?" disabled":"")+'>Check prediction</button><button type="button" class="pp-link" id="sale-watch">Just show me the sale</button></div></div>';
    } else {
      if (sale.selected!==null) {
        const right=r.options[sale.selected].value===r.mr;
        let why=right?"Correct.":"The change is "+change(r.mr)+".";
        if(!right)why+=r.options[sale.selected].value===r.after?" You chose the new total revenue; MR is the change from the previous total.":mono?" Count the price cut on earlier units as well as the revenue from the new unit.":" A price-taking firm keeps the same price on its earlier units.";
        h+='<div class="pp-feedback'+(right?"":" pp-bad")+'" role="status">'+esc(why)+"</div>";
      }
      h+=units(r);
      h+='<div class="mp-equation" aria-label="Revenue change calculation"><div><strong class="mp-positive">'+change(r.gain)+'</strong><span>From the new unit</span></div><span class="mp-op">−</span><div><strong class="'+(r.loss?"mp-negative":"")+'">'+dollars(r.loss)+'</strong><span>Lost on earlier units</span></div><span class="mp-op">=</span><div><strong>'+change(r.mr)+'</strong><span>Marginal revenue</span></div></div>';
      h+='<div class="mp-before-after"><div><span class="mp-label">Total revenue before</span><div class="mp-amount">'+dollars(r.before)+'</div></div><span class="mp-arrow" aria-hidden="true">→</span><div><span class="mp-label">Total revenue after</span><div class="mp-amount">'+dollars(r.after)+"</div></div></div>";
      h+='<p class="mp-takeaway">Price is <strong>'+dollars(r.newp)+'</strong> per unit. Total revenue '+(r.mr>0?"rises by <strong>"+dollars(r.mr):r.mr<0?"falls by <strong>"+dollars(-r.mr):"changes by <strong>$0")+"</strong>.</p>";
      if(r.mr<0)h+='<p>The price cuts on earlier units cost more than the new unit brings in. Selling more can reduce total revenue.</p>';
      if(r.mr===0)h+='<p>The new unit\u2019s revenue exactly offsets the price cuts on earlier units.</p>';
      if(!mono)h+='<p>No earlier unit loses revenue, so <strong>MR = price</strong>.</p>';
      h+='<div class="pp-actions">'+(!last?'<button type="button" class="pp-primary" id="sale-next">Sell one more →</button>':'<button type="button" class="pp-primary" id="sale-switch">Try the '+(mono?"price-taking firm":"monopoly")+'</button>')+'<button type="button" id="sale-reset">Start over</button></div>';
      h+='<details class="mp-support" id="sale-graph"'+(sale.graphOpen?" open":"")+'><summary>Connect it to a graph</summary>'+revenueGraph(r)+"</details>";
      h+='<details class="mp-support" id="sale-table"'+(sale.tableOpen?" open":"")+'><summary>See the revenue table</summary>'+revenueTable(r)+"</details>";
    }
    revenueHost.innerHTML=h;
    revenueHost.querySelectorAll("[data-predict]").forEach(b=>b.onclick=()=>{
      sale.selected=Number(b.dataset.predict);
      revenueHost.querySelectorAll("[data-predict]").forEach(x=>x.setAttribute("aria-pressed",x===b));
      revenueHost.querySelector("#sale-check").disabled=false;
    });
    const check=revenueHost.querySelector("#sale-check");
    if(check)check.onclick=()=>reveal(r,sale.selected,sale.order.indexOf(sale.selected));
    const watch=revenueHost.querySelector("#sale-watch");
    if(watch)watch.onclick=()=>{sale.selected=null;sale.revealed=true;drawSale();revenueHost.querySelector("#sale-next, #sale-reset").focus({preventScroll:true});};
    const next=revenueHost.querySelector("#sale-next");
    if(next)next.onclick=()=>{sale.step++;prepareSale();drawSale();revenueHost.querySelector("[data-predict]").focus({preventScroll:true});};
    const reset=revenueHost.querySelector("#sale-reset");
    if(reset)reset.onclick=()=>{sale.step=0;prepareSale();drawSale();revenueHost.querySelector("[data-predict]").focus({preventScroll:true});};
    const switcher=revenueHost.querySelector("#sale-switch");
    if(switcher)switcher.onclick=()=>setModel(mono?"competitive":"monopoly");
    for(const [id,key] of [["sale-graph","graphOpen"],["sale-table","tableOpen"]]){
      const d=revenueHost.querySelector("#"+id);if(d)d.ontoggle=()=>{sale[key]=d.open;};
    }
  }

  function setModel(model){
    sale.model=model;sale.step=0;prepareSale();
    document.querySelectorAll("[data-model]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.model===model));
    drawSale();
  }
  document.querySelectorAll("[data-model]").forEach(b=>b.onclick=()=>setModel(b.dataset.model));
  function route(){
    const target=location.hash==="#revenue"?"revenue":"graphs";
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
