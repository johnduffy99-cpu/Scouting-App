import test from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';

const root=new URL('../',import.meta.url);
const [html,manifestText,css,main,model,serviceWorker,appleIcon,icon192,icon512,maskableIcon]=await Promise.all([
 readFile(new URL('index.html',root),'utf8'),
 readFile(new URL('manifest.webmanifest',root),'utf8'),
 readFile(new URL('src/styles.css',root),'utf8'),
 readFile(new URL('src/main.js',root),'utf8'),
 readFile(new URL('src/model.js',root),'utf8'),
 readFile(new URL('sw.js',root),'utf8'),
 readFile(new URL('icons/apple-touch-icon.png',root)),
 readFile(new URL('icons/icon-192.png',root)),
 readFile(new URL('icons/icon-512.png',root)),
 readFile(new URL('icons/icon-maskable-512.png',root))
]);
const manifest=JSON.parse(manifestText);

test('keeps page-level accessibility zoom enabled',()=>{
 assert.doesNotMatch(html,/user-scalable\s*=\s*no/i);
 assert.doesNotMatch(html,/maximum-scale\s*=\s*1/i);
});

test('prevents mobile focus zoom without globally locking the page',()=>{
 assert.match(css,/input,select,textarea\{font-size:16px\}/);
});

test('provides install-ready Home Screen metadata and icons',()=>{
 assert.equal(manifest.id,'/');
 assert.equal(manifest.scope,'/');
 assert.equal(manifest.display,'standalone');
 assert.equal(manifest.orientation,'portrait-primary');
 assert.deepEqual(manifest.icons.map(icon=>[icon.sizes,icon.type,icon.purpose]),[['192x192','image/png','any'],['512x512','image/png','any'],['512x512','image/png','maskable']]);
 assert.match(html,/apple-mobile-web-app-capable" content="yes"/);
 assert.match(html,/apple-mobile-web-app-status-bar-style" content="black-translucent"/);
 assert.match(html,/apple-mobile-web-app-title" content="Scoutline"/);
 assert.match(html,/rel="apple-touch-icon" sizes="180x180" href="\/icons\/apple-touch-icon\.png"/);
 for(const icon of[appleIcon,icon192,icon512,maskableIcon])assert.deepEqual([...icon.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 for(const asset of['apple-touch-icon.png','icon-192.png','icon-512.png','icon-maskable-512.png'])assert.match(serviceWorker,new RegExp(asset.replace('.','\\.')));
});

test('limits gesture locking to match-day interaction surfaces',()=>{
 assert.match(css,/\.pitch\{[^}]*touch-action:pan-y/);
 assert.match(css,/\.quality-grid,\.body-grid,\.action-grid,\.area-pitch,\.goal-zone\{touch-action:pan-y\}/);
 assert.doesNotMatch(css,/body\{[^}]*touch-action:(?:none|pan-y)/);
 assert.doesNotMatch(css,/\.shell\{[^}]*touch-action:(?:none|pan-y)/);
});

test('provides the wide Quick Note route and explicit note scopes',()=>{
 assert.match(css,/\.quick-note-button\{[^}]*grid-column:span 2/);
 assert.match(css,/\.note-scope>div\{[^}]*grid-template-columns:repeat\(3,1fr\)/);
});

test('keeps evidence grouping behind a compact second action page',()=>{
 for(const heading of['Positioning','Movement','Physical','Technique','Decision'])assert.match(model,new RegExp(`evidenceCategory:'${heading}'`));
 assert.match(main,/name="actions"/);
 assert.match(main,/continue-actions/);
 assert.match(main,/continue-secondary-actions/);
 for(const action of['movement','off-ball-run','strength','speed','acceleration','pace-with-ball','first-touch','control','footwork','decision'])assert.match(model,new RegExp(action));
 assert.match(main,/data-secondary-action/);
 assert.match(main,/data-evidence-category/);
 assert.doesNotMatch(main,/stage:'other',quality:'',bodyPart:''/);
 assert.match(css,/\.page-two-grid\{grid-template-columns:repeat\(4,1fr\)/);
});

test('requires core match metadata and blocks reporting exports until it is complete',()=>{
 assert.match(main,/name="venue" required/);
 assert.match(main,/name="matchDate" type="date"[^>]*required/);
 assert.match(main,/function ensureExportMetadata/);
 assert.match(main,/downloadStructuredExport\(\).*ensureExportMetadata\('structured'\)/);
 assert.match(main,/downloadHandoffReport\(\).*ensureExportMetadata\('handoff'\)/);
});

test('provides the approved seven-zone goalkeeper workflow',()=>{
 assert.match(main,/GOALKEEPER OBSERVATION · 2 OF 2/);
 assert.match(main,/name="shotOrigin"/);
 assert.match(main,/name="goalkeeperOutcome"/);
 assert.match(css,/\.shot-origin\{/);
 assert.match(css,/\.gk-outcomes\{/);
});

test('keeps UI save state separate from football goalkeeper outcomes',()=>{
 assert.match(main,/goalkeeperSave=selectedActions\.includes\('save'\)/);
 assert.match(main,/goalkeeperOutcome=goalkeeperSave\?/);
});

test('guards emergency attribution correction behind hold and explicit confirmation',()=>{
 assert.match(main,/data-correct-event/);
 assert.match(main,/setTimeout\(\(\)=>.*openAttributionCorrection/s);
 assert.match(main,/name="confirmed" required/);
 assert.match(main,/Attribution corrected/);
 assert.doesNotMatch(main,/contenteditable/);
});

test('auto-dismisses pitch-capture confirmation',()=>{
 assert.match(main,/function capturePitch\(\).*savedNoticeTimer=setTimeout/);
});

test('supports solid team colours and the staged Team 2 placement flow',()=>{
 assert.match(main,/name="teamColour"/);
 assert.match(main,/Now add Team 2/);
 assert.match(main,/Team 1 is temporarily hidden/);
 assert.match(main,/stage='team2'/);
 assert.match(main,/placingSecond=state\.match\.deployment\?\.stage==="team2"/);
 assert.match(main,/Confirm Team 2 positions/);
 assert.match(main,/function confirmTeamTwoPositions/);
 assert.match(css,/background:var\(--team-color/);
 assert.match(css,/\.colour-swatches\{/);
});

test('allows a saved team-sheet image instead of forcing the mobile camera',()=>{
 assert.match(main,/name="image" type="file" accept="image\/\*"/);
 assert.doesNotMatch(main,/capture="environment"/);
 assert.match(main,/Choose saved image or take photo/);
});

test('supports one-image two-team extraction through sequential validation',()=>{
 assert.match(main,/name="bothTeams"/);
 assert.match(main,/bothTeams=d\.get\('bothTeams'\)==='on'/);
 assert.match(main,/showPendingLineupReview/);
 assert.match(main,/Use AI Assistant · pluggable source/);
});

test('provides assignment-led notes, team choice and capped player targets',()=>{
 for(const label of['Scouting — General','Scouting — Team Specific','Scouting — Player Specific','Scouting — Opposition','Coaching — General','Coaching — Player Specific','Goalkeeper Coaching — Specific','Media','Observer / Other'])assert.match(main,new RegExp(label));
 assert.match(main,/name="assignmentTeam"/);
 assert.match(main,/PLAYER_TARGET_ASSIGNMENTS/);
 assert.match(main,/selected\.length>4/);
 assert.match(main,/Maximum of four players/);
 assert.match(main,/data-goalkeeper/);
});

test('identifies the installed Version 1.8 app and Version 1.7 export schema',()=>{
 assert.match(main,/VERSION 1\.7 FIELD-TEST EXPORT/);
 assert.match(serviceWorker,/scoutline-v1-8-0-build-2026-09-05-4/);
});

test('keeps pre-match evidence separate from clock-start state and provides visible failure feedback',()=>{
 assert.doesNotMatch(main,/clock\.seconds>0\|\|state\.events\.length>0/);
 assert.match(main,/event\.type!==\'pitch-capture\'/);
 assert.match(main,/role="alert" aria-live="assertive"/);
 assert.match(main,/Your existing match data is unchanged/);
 assert.match(main,/Review the players on the pitch/);
});
