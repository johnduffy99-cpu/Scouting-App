import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('.');
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+(req.url==='/'?'/index.html':req.url));if(!path.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',extname(path)==='.js'?'text/javascript':extname(path)==='.css'?'text/css':'text/html');res.end(await readFile(path))}catch{res.statusCode=404;res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=`http://127.0.0.1:${server.address().port}`;
 await page.goto(url);await page.click('#new-match');await page.selectOption('[name=sessionMode]','goalkeeper-only');
 for(const [name,value] of Object.entries({home:'Home',away:'Away',competition:'League',venue:'Ground'}))await page.fill(`[name=${name}]`,value);
 await page.click('#match-form .primary');assert.equal(await page.locator('#start-match').count(),0);
 async function add(side,name){await page.click('#add-player');await page.selectOption('[name=teamSide]',side);await page.fill('[name=name]',name);await page.click('#player-form .primary')}
 await add('away','Away Keeper');assert.equal(await page.locator('#start-match').count(),1);
 await page.reload();await page.click('#resume');assert.equal(await page.locator('[data-player]').count(),1);await page.screenshot({path:'verification/gk-only/one-keeper.png',fullPage:true});
 assert.equal(await page.locator('#import-lineup, #capture-pitch, #confirm-placement').count(),0);
 await add('home','Home Keeper');assert.equal(await page.locator('#add-player').count(),0);
 await page.screenshot({path:'verification/gk-only/two-keepers.png',fullPage:true});await page.click('#start-match');
 const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('scoutline-sprint1')));
 let state=await stored();assert.equal(state.clock.period,'first');
 for(const p of state.players){await page.click(`[data-player="${p.id}"]`);assert.equal(await page.locator('#action-form').count(),0);await page.getByText('Good',{exact:true}).click();await page.locator('[name=bodyPart][value=both-hands]').locator('..').click();await page.click('#gk-additional');await page.locator('[name=gkAction][value=distribution]').locator('..').click();await page.click('#gk-form .primary');await page.click('#gk-close')}
 state=await stored();assert.equal(state.events.length,2);assert.notEqual(state.events[0].playerId,state.events[1].playerId);
 await page.click('#report-notes');for(const p of state.players)await page.selectOption(`[name="rating-${p.id}"]`,'8');await page.click('#assessment-form .primary');
 await page.reload();await page.click('#resume');state=await stored();assert.ok(state.players.every(p=>p.rating===8));assert.equal(state.events.length,2);
 await page.click('#end-session');await page.click('#choose-full-time');await page.fill('#full-time-form [name=note]','Goalkeeper assessment complete.');await page.click('#confirm-full-time');
 let submitted;
 await page.route('**/api/match-submissions',async route=>{submitted=JSON.parse(route.request().postData());await route.fulfill({json:{pipelineStatus:'Received by SIP',receiptId:'LOCAL-MOCK'}})});
 await page.click('#submit-match');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('scoutline-sprint1')).match.submissionStatus==='Received by SIP');
 const exported=JSON.parse(submitted.source.json);assert.equal(exported.players.length,2);assert.equal(exported.match.assignment.type,'goalkeeper-only');assert.equal(exported.observations.length,2);
 await page.reload();await page.click('#resume');assert.equal((await stored()).match.submissionReceipt.receiptId,'LOCAL-MOCK');assert.deepEqual(errors,[]);
 console.log('PASS: mobile setup, away-only resume, two keepers, switching, GK actions, ratings, persistence and mocked submission receipt');
}finally{await browser.close();server.close()}
