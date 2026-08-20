import test from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';

const root=new URL('../',import.meta.url);
const [html,css,main,serviceWorker]=await Promise.all([
 readFile(new URL('index.html',root),'utf8'),
 readFile(new URL('src/styles.css',root),'utf8'),
 readFile(new URL('src/main.js',root),'utf8'),
 readFile(new URL('sw.js',root),'utf8')
]);

test('keeps page-level accessibility zoom enabled',()=>{
 assert.doesNotMatch(html,/user-scalable\s*=\s*no/i);
 assert.doesNotMatch(html,/maximum-scale\s*=\s*1/i);
});

test('prevents mobile focus zoom without globally locking the page',()=>{
 assert.match(css,/input,select,textarea\{font-size:16px\}/);
});

test('limits gesture locking to match-day interaction surfaces',()=>{
 assert.match(css,/\.pitch\{[^}]*touch-action:pan-y/);
 assert.match(css,/\.quality-grid,\.body-grid,\.action-grid,\.area-pitch,\.goal-zone\{touch-action:pan-y\}/);
 assert.doesNotMatch(css,/body\{[^}]*touch-action:(?:none|pan-y)/);
 assert.doesNotMatch(css,/\.shell\{[^}]*touch-action:(?:none|pan-y)/);
});

test('provides the wide Quick Note route and explicit note scopes',()=>{
 assert.match(css,/\.quick-note-button\{[^}]*grid-column:span 3/);
 assert.match(css,/\.note-scope>div\{[^}]*grid-template-columns:repeat\(3,1fr\)/);
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

test('provides assignment-led notes, team choice and capped player targets',()=>{
 for(const label of['Scouting — General','Scouting — Team Specific','Scouting — Player Specific','Scouting — Opposition','Coaching — General','Coaching — Player Specific','Goalkeeper Coaching — Specific','Media','Observer / Other'])assert.match(main,new RegExp(label));
 assert.match(main,/name="assignmentTeam"/);
 assert.match(main,/PLAYER_TARGET_ASSIGNMENTS/);
 assert.match(main,/selected\.length>4/);
 assert.match(main,/Maximum of four players/);
 assert.match(main,/data-goalkeeper/);
});

test('identifies the installed field-test build as Version 1.7',()=>{
 assert.match(main,/VERSION 1\.7 FIELD-TEST EXPORT/);
 assert.match(serviceWorker,/scoutline-v1-7-0/);
});
