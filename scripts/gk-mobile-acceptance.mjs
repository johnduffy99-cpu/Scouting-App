import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');

const url=process.env.SCOUTLINE_TEST_URL||'http://127.0.0.1:4174';
const screenshotDir=process.env.GK_SCREENSHOT_DIR||'';
const capture=async(page,name)=>{if(screenshotDir)await page.screenshot({path:`${screenshotDir}/${name}.png`,fullPage:false})};
const storageKey='scoutline-sprint1';
const matchState={
 match:{home:'Test Home',away:'Test Away',competition:'Mobile acceptance',venue:'Test',matchDate:'2026-09-06',createdAt:1,placementConfirmed:true},
 players:[{id:'gk1',name:'Test Keeper',number:'1',position:'GK',goalkeeper:true,teamSide:'home',teamColor:'#ef4444',initialSquadRole:'starter',squadRole:'starter',x:50,y:90}],
 events:[],lineups:{home:null,away:null},clock:{seconds:600,running:false,startedAt:null,period:'first'}
};

const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
const newPage=async()=>{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.addInitScript(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:storageKey,state:matchState});
 await page.goto(url,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:/1 Test Keeper/}).click();
 await page.getByText('Good',{exact:true}).click();
 await page.getByText('Both hands',{exact:true}).click();
 return page;
};

const savePage=await newPage();
await savePage.getByText('Save',{exact:true}).click();
await capture(savePage,'01-page-one-save');
assert.equal(await savePage.getByRole('button',{name:'Save to timeline'}).isEnabled(),true);
await savePage.getByRole('button',{name:/Continue with/}).click();
await capture(savePage,'03-save-location');
assert.equal(await savePage.getByText('GOALKEEPER SAVE · LOCATION').isVisible(),true);
assert.equal(await savePage.getByLabel('Save location').isVisible(),true);
assert.equal(await savePage.getByLabel('Shot origin area').isVisible(),true);
assert.equal(await savePage.getByText('Outcome',{exact:true}).count(),0);
assert.deepEqual(await savePage.evaluate(()=>({width:innerWidth,height:innerHeight})),{width:390,height:844});
await savePage.close();

const goalPage=await newPage();
await goalPage.getByText('Goal',{exact:true}).click();
await goalPage.getByRole('button',{name:/Continue with/}).click();
await capture(goalPage,'04-goal-location');
assert.equal(await goalPage.getByText('GOALKEEPER GOAL · LOCATION').isVisible(),true);
assert.equal(await goalPage.getByLabel('Goal location').isVisible(),true);
await goalPage.close();

const ordinaryPage=await newPage();
await ordinaryPage.getByText('Pass',{exact:true}).click();
await ordinaryPage.getByRole('button',{name:/Continue with/}).click();
assert.equal(await ordinaryPage.getByLabel('Shot origin area').count(),0);
await ordinaryPage.close();

const pageTwo=await newPage();
await pageTwo.getByText('Pass',{exact:true}).click();
await pageTwo.getByRole('button',{name:'Other'}).click();
await capture(pageTwo,'02-page-two');
assert.equal(await pageTwo.getByText('ACTION · PAGE 2').isVisible(),true);
assert.equal(await pageTwo.getByRole('button',{name:'Save to timeline'}).isEnabled(),true);
await pageTwo.close();

await browser.close();
console.log('GK mobile acceptance passed at 390x844.');
