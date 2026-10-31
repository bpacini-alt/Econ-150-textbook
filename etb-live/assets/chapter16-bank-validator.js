/* Chapter 16 bank lint. Run in a browser console or a JS-capable CI environment after loading the bank. */
(function(root){
"use strict";
function check(bank){
 const errors=[],warn=[];const err=(where,msg)=>errors.push(where+": "+msg);
 if(!bank||bank.chapter!==16||!Array.isArray(bank.concepts)||bank.concepts.length!==4)err("bank","expected Chapter 16 and four concepts");
 const seen=new Set();
 (bank.concepts||[]).forEach((c,i)=>{
 const loc="concept "+(i+1);
 if(!Array.isArray(c.cats)||c.cats.length<2)err(loc,"missing categories");
 (c.foundation||[]).forEach((q,j)=>{if(typeof q.q!=="string"||!q.q.trim())err(loc+" foundation "+j,"empty prompt");if(!Number.isInteger(q.a)||q.a<0||q.a>=c.cats.length)err(loc+" foundation "+j,"invalid answer index")});
 (c.applied||[]).forEach((q,j)=>{const at=loc+" applied "+(j+1);if(!q.q||!q.q.trim())err(at,"missing prompt");if(!Array.isArray(q.opts)||q.opts.length<3||q.opts.some(x=>!x||!x.trim()))err(at,"requires 3+ nonblank choices");if(!Number.isInteger(q.a)||q.a<0||q.a>=q.opts.length)err(at,"invalid answer key");if(!q.why||!q.why.trim())err(at,"missing explanatory feedback")});
 (c.cards||[]).forEach((q,j)=>{if(!Array.isArray(q)||q.length!==2||q.some(v=>!v))err(loc+" card "+j,"expected term and explanation")});
 const x=bank.extra&&bank.extra[i];if(!x){err(loc,"missing extra formats");return}
 (x.detect||[]).forEach((q,j)=>{if(!Array.isArray(q)||q.length!==3||!["A","A−","F"].includes(q[1])||!q[2])err(loc+" detective "+j,"invalid A/A−/F label or feedback")});
 (x.predict||[]).forEach((q,j)=>{if(!Array.isArray(q)||q.length!==4||!Array.isArray(q[1])||q[1].length<3||!Number.isInteger(q[2])||q[2]<0||q[2]>=q[1].length||!q[3])err(loc+" predict "+j,"invalid predictive question")});
 for(const type of ["missing","error"])(x[type]||[]).forEach((q,j)=>{if(!Array.isArray(q)||q.length!==4||!Array.isArray(q[1])||q[1].length<3||!Number.isInteger(q[2])||q[2]<0||q[2]>=q[1].length||!q[3])err(loc+" "+type+" "+j,"invalid response, key or feedback")});
 });
 (bank.exam||[]).forEach((q,i)=>{const at="exam "+(i+1);if(!q.id||seen.has(q.id))err(at,"missing or duplicate stable ID");seen.add(q.id);if(!q.prompt||!q.prompt.trim())err(at,"empty prompt");if(!Array.isArray(q.concepts)||!q.concepts.length||q.concepts.some(n=>!Number.isInteger(n)||n<1||n>4))err(at,"invalid concept tags");if(q.type==="mc"){if(!Array.isArray(q.choices)||q.choices.length<3||q.choices.some(v=>!v||!v.trim())||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.choices.length||!q.feedback)err(at,"invalid MC choices, key or feedback")}else if(q.type==="frq"){if(!Array.isArray(q.rubric)||q.rubric.length<3||q.rubric.some(v=>!v)||!q.feedback)err(at,"incomplete FRQ rubric or feedback")}else err(at,"unknown type");if(q.reviewStatus!=="approved")warn.push(at+": not yet instructor-approved")});
 return {ok:errors.length===0,errors,warnings:warn,counts:{concepts:(bank.concepts||[]).length,applied:(bank.concepts||[]).reduce((n,c)=>n+(c.applied||[]).length,0),exam:(bank.exam||[]).length}};
}
root.validatePreciseBank16=check;
if(root.PRECISE_BANK_CH16){const result=check(root.PRECISE_BANK_CH16);if(!result.ok)throw new Error("Chapter 16 question bank validation failed: "+result.errors.join("; "));}
})(typeof window!=="undefined"?window:globalThis);
