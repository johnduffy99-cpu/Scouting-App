import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const url=process.env.SCOUTLINE_TEST_URL||'http://127.0.0.1:4187';
const key='scoutline-sprint1';
try {
 for(const period of ['pre','first','halftime','second','fulltime','terminated']){
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();await page.goto(url);
  const state={match:{home:'Home test',away:'Away test',createdAt:1,placementConfirmed:true,reportStatus:period==='fulltime'?'unfinished':'draft'},players:[],events:[{id:'preserved',type:'quick-note',note:'Evidence retained',comment:'Evidence retained',second:12,period:'first'}],clock:{firstHalfEndedAt:null,period,seconds:period==='pre'?0:120,running:period==='first',startedAt:period==='first'?Date.now()-2000:null},lineups:{home:null,away:null}};
  await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key,state});await page.reload();
  await page.locator('#new-match').waitFor();assert.match(await page.locator('.release-version').innerText(),/App v1\.8\.2/);
  const restored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.deepEqual(restored.events,state.events);assert.deepEqual(restored.clock,state.clock);
  await page.locator('#resume').click();assert.equal(await page.locator('#new-match').count(),0);assert.match(await page.locator('.release-version').innerText(),/App v1\.8\.2/);
  if(['fulltime','terminated'].includes(period))await page.locator('#summary-home').waitFor();else await page.locator('#home').waitFor();
  await page.reload();await page.locator('#new-match').waitFor();assert.deepEqual((await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)).events,state.events);
  await context.close();
 }
 const context=await browser.newContext();const page=await context.newPage();await page.goto(url);await page.locator('#new-match').waitFor();assert.equal(await page.locator('#resume').count(),0);await context.close();
 console.log('7 launch scenarios passed: fresh, pre-match, running, half-time, second half, full-time/unfinished, terminated; explicit recovery, footer and evidence preservation verified.');
}finally{await browser.close()}
