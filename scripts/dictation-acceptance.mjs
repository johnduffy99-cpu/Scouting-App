// Synthetic recognition events validate app integration, not acoustic accuracy.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('dist');
const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+(req.url==='/'?'/index.html':req.url));if(!p.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(p)==='.js'?'text/javascript':extname(p)==='.css'?'text/css':'text/html');res.end(await readFile(p))}catch{res.statusCode=404;res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
const key='scoutline-sprint1';
const fixture={match:{home:'Home test',away:'Away test',competition:'Test',venue:'Test',createdAt:1,assignmentType:'scouting-player',otherPlayerNames:'none',assignmentConfirmed:true,placementConfirmed:true},players:[{id:'target',name:'Target',number:'9',teamSide:'home',position:'FWD',target:true,squadRole:'starter',x:50,y:50}],events:[],clock:{period:'first',seconds:600,running:false},lineups:{home:null,away:null}};
try{
 const page=await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true,serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.recognizers=[];window.SpeechRecognition=class{constructor(){window.recognizers.push(this)}start(){}stop(){this.stopped=true}abort(){this.aborted=true;this.onend?.()}};window.emitWords=(text,final=true)=>window.recognizers.at(-1).onresult({resultIndex:0,results:[Object.assign([{transcript:text}],{isFinal:final})]})});
 const url=`http://127.0.0.1:${server.address().port}`;await page.goto(url);await page.evaluate(({key,fixture})=>localStorage.setItem(key,JSON.stringify(fixture)),{key,fixture});await page.reload();await page.click('#resume');
 const open=async()=>{await page.click('[data-player="target"]');await page.click('#quick-note')};
 await open();await page.fill('[name=note]','Typed prefix.');
 for(let i=0;i<10;i++){
  await page.click('#dictate');assert.match(await page.locator('#dictation-status').innerText(),/Starting/);await page.evaluate(()=>window.recognizers.at(-1).onaudiostart());
  await page.evaluate(i=>{window.emitWords(`Attempt ${i}`,false);window.emitWords(`Attempt ${i}.`,true)},i);await page.click('#dictate');await page.evaluate(()=>window.recognizers.at(-1).onend());
 }
 assert.equal(await page.locator('[name=note]').inputValue(),'Typed prefix. '+Array.from({length:10},(_,i)=>`Attempt ${i}.`).join(' '));assert.match(await page.locator('[name=comment]').inputValue(),/Attempt 9/);
 await page.click('#dictate');await page.evaluate(()=>window.emitWords('Preserve on save',false));await page.click('#save-observation');
 await page.evaluate(()=>window.emitWords('late incorrect text'));let stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(stored.events.length,1);assert.match(stored.events[0].note,/Preserve on save$/);assert.doesNotMatch(stored.events[0].note,/late incorrect/);assert.equal(stored.players.length,1);
 await open();await page.click('#dictate');await page.evaluate(()=>window.emitWords('Before edit'));await page.fill('[name=note]','Manual correction');await page.evaluate(()=>window.emitWords('stale'));assert.equal(await page.locator('[name=note]').inputValue(),'Manual correction');assert.equal(await page.locator('#dictate').getAttribute('aria-pressed'),'false');
 await page.click('#dictate');await page.click('.close-panel');assert.equal(await page.evaluate(()=>window.recognizers.at(-1).aborted),true);
 // Half-time and ending forms use the same controller and lifecycle protection.
 await page.click('#half-time');await page.click('#half-time-confirm .primary');await page.click('#dictate');await page.evaluate(()=>window.emitWords('Half time words'));await page.click('#half-time-form .primary');assert.equal((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)).match.halfTimeNote,'Half time words');
 await page.click('#second-half');await page.click('#end-session');await page.click('#choose-full-time');await page.click('#dictate');await page.evaluate(()=>window.emitWords('Full time words'));await page.click('#confirm-full-time');assert.equal((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)).match.fullTimeNote,'Full time words');
 // Goalkeeper editor also updates its draft when dictation dispatches input.
 const gk=structuredClone(fixture);gk.match.assignmentType='goalkeeper-only';gk.players[0].goalkeeper=true;gk.players[0].position='GK';await page.evaluate(({key,gk})=>localStorage.setItem(key,JSON.stringify(gk)),{key,gk});await page.reload();await page.click('#resume');await page.click('[data-player="target"]');await page.click('#gk-note');await page.click('#dictate');await page.evaluate(()=>window.emitWords('Keeper note'));await page.click('#gk-additional');assert.equal(await page.locator('[name=note]').inputValue(),'Keeper note');assert.equal(await page.evaluate(()=>window.recognizers.at(-1).aborted),true);
 await mkdir('verification/dictation',{recursive:true});await page.screenshot({path:'verification/dictation/gk-note.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: 10 repeated dictations, revised interim results, quick-note/comment/save, manual edit, close, half-time, full-time, GK note and draft navigation; synthetic recognition only.');
}finally{await browser.close();server.close()}
