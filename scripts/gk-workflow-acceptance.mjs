import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url=process.env.SCOUTLINE_TEST_URL || 'http://127.0.0.1:4187';
const output=process.env.GK_SCREENSHOT_DIR || '/private/tmp/gk-workflow-screens';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
const key='scoutline-sprint1';
const state={match:{home:'Forfar',away:'Visitors',competition:'Acceptance test',venue:'Test',matchDate:'2026-09-19',createdAt:1,placementConfirmed:true},players:[{id:'gk1',name:'Neil Stafford',number:'21',goalkeeper:true,position:'GK',teamSide:'home',squadRole:'starter',x:50,y:80},{id:'p1',name:'Outfield Player',number:'9',position:'FWD',teamSide:'away',squadRole:'starter',x:30,y:30}],events:[{id:'existing',playerId:'p1',playerName:'Outfield Player',number:'9',teamSide:'away',action:'pass',quality:'Good',comment:'Existing evidence must survive.',second:60,period:'first'}],lineups:{home:null,away:null},clock:{seconds:1457,running:false,period:'first'}};
let checks=0;
const errors=[];
const newPage=async()=>{const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(url);await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key,state});await page.reload();await page.locator("#resume").click();return page;};
const open=async page=>{await page.locator('[data-player="gk1"]').click();await page.getByText('Good',{exact:true}).click();await page.locator('[name=bodyPart][value=right-hand]').locator('..').click();};
const choose=async(page,label)=>page.locator('.action-grid').getByText(label,{exact:true}).click();
const save=async page=>page.getByRole('button',{name:'Save to Timeline',exact:true}).click();
const data=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
const capture=async(page,name)=>{await page.locator('.gk-panel').evaluate(el=>{el.scrollTop=0;document.activeElement?.blur()});assert.equal(await page.locator('.gk-panel .player-title').isVisible(),true);if(name==='01-core'||name==='03-location'){const box=await page.locator('#gk-note').boundingBox();assert.ok(box.y+box.height<=844,'Quick Note must fit in the mobile viewport')}await page.screenshot({path:`${output}/${name}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);};
try{
 const page=await newPage();await open(page);await choose(page,'Punch');await capture(page,'01-core');
 await page.getByRole('button',{name:'Quick Note',exact:false}).click();await page.locator('[name=note]').fill('Looked to play long early');
 await page.getByRole('button',{name:/Additional Actions/}).click();await choose(page,'Distribution');await choose(page,'Kick from Hand');await capture(page,'02-additional');
 await page.getByRole('button',{name:'‹ Back',exact:true}).click();assert.equal(await page.locator('[name=gkAction][value=punch]').isChecked(),true);assert.equal(await page.locator('[name=note]').inputValue(),'Looked to play long early');
 await page.getByRole('button',{name:/Additional Actions/}).click();assert.equal(await page.locator('[value=distribution]').isChecked(),true);await save(page);
 await page.getByRole('heading',{name:'Observation Saved'}).waitFor();await capture(page,'04-complete');
 let stored=await data(page);assert.equal(stored.events.length,2);assert.deepEqual(stored.events[0],state.events[0]);assert.deepEqual(stored.events[1].actions,['punch','distribution','kick-from-hand']);assert.equal(stored.events[1].note,'Looked to play long early');assert.equal(stored.events[1].saveLocation,'');
 await page.getByRole('button',{name:'Add Another Observation'}).click();assert.equal(await page.locator('[name=gkAction]:checked').count(),0);assert.equal(await page.locator('[name=quality]:checked').count(),0);await page.getByRole('button',{name:'Close',exact:true}).click();await page.reload();await page.locator('#resume').click();assert.match(await page.locator('.timeline').innerText(),/Punch, Distribution, Kick from Hand/);assert.deepEqual((await data(page)).events,stored.events);checks++;
 for(const action of ['Save','Goal'])for(const from of [1,2]){
  const p=await newPage();await open(p);await choose(p,action);if(from===2){await p.getByRole('button',{name:/Additional Actions/}).click();await choose(p,'Reaction');}
  await save(p);assert.match(await p.locator('.panel-step').innerText(),/3 OF 3/);assert.equal((await data(p)).events.length,1);
  await p.getByText('Top left',{exact:true}).click();await save(p);assert.equal((await data(p)).events.length,1);
  await p.getByText('Centre',{exact:true}).click();await p.getByRole('button',{name:/Quick Note/}).click();await p.locator('[name=note]').fill(`${action} spatial note`);
  if(action==='Save'&&from===1)await capture(p,'03-location');
  await p.getByRole('button',{name:'‹ Back',exact:true}).click();assert.match(await p.locator('.panel-step').innerText(),new RegExp(`${from} OF 3`));await save(p);assert.equal(await p.locator('[name=area]:checked').inputValue(),'goal-top-left');assert.equal(await p.locator('[name=shotOrigin]:checked').inputValue(),'box-centre');assert.equal(await p.locator('[name=note]').inputValue(),`${action} spatial note`);
  await save(p);await p.getByRole('heading',{name:'Observation Saved'}).waitFor();stored=await data(p);assert.equal(stored.events.length,2);assert.equal(stored.events[1].goalkeeperOutcome,action.toLowerCase());assert.equal(stored.events[1].shotOrigin,'box-centre');await p.reload();assert.deepEqual((await data(p)).events,stored.events);checks++;await p.context().close();
 }
 const direct=await newPage();await open(direct);await choose(direct,'Parry');await save(direct);await direct.getByRole('heading',{name:'Observation Saved'}).waitFor();assert.equal((await data(direct)).events[1].actions[0],'parry');checks++;
 const stale=await newPage();await open(stale);await choose(stale,'Save');await save(stale);await stale.getByText('Top left',{exact:true}).click();await stale.getByText('Centre',{exact:true}).click();await stale.getByRole('button',{name:'‹ Back',exact:true}).click();await choose(stale,'Save');await choose(stale,'Punch');await save(stale);assert.equal((await data(stale)).events[1].saveLocation,'');assert.equal((await data(stale)).events[1].shotOrigin,'');checks++;
 for(const label of ['Yellow Card','Second Yellow','Straight Red']){
  const p=await newPage();await open(p);await p.getByRole('button',{name:/Additional Actions/}).click();await choose(p,label);await save(p);await p.getByRole('heading',{name:'Observation Saved'}).waitFor();const s=await data(p);assert.equal(Boolean(s.players[0].sentOff),label!=='Yellow Card');assert.equal(s.events.length,2);await p.reload();assert.equal((await data(p)).players[0].squadRole,label==='Yellow Card'?'starter':'sent-off');checks++;await p.context().close();
 }
 const failure=await newPage();await open(failure);await choose(failure,'Punch');await failure.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new Error('QuotaExceededError')}});await save(failure);assert.match(await failure.locator('#gk-error').innerText(),/Could not save/);assert.equal(await failure.locator('[value=punch]').isChecked(),true);assert.equal((await data(failure)).events.length,1);await failure.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);await save(failure);assert.equal((await data(failure)).events.length,2);checks++;
 const outfield=await newPage();await outfield.locator('[data-player=p1]').click();await outfield.getByText('Good',{exact:true}).click();await outfield.locator('[name=bodyPart][value=right-foot]').locator('..').click();await outfield.getByText('Pass',{exact:true}).click();await outfield.locator('#continue-actions').click();await outfield.getByRole('button',{name:'Save to timeline',exact:true}).click();assert.equal((await data(outfield)).events.length,2);assert.equal((await data(outfield)).events[1].action,'pass');checks++;
 assert.deepEqual(errors,[]);console.log(`${checks} mobile browser scenarios passed at 390x844; reload, storage-failure recovery, cards, outfield regression and screenshots verified.`);
}finally{await browser.close()}
