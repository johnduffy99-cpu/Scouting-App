import test from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';

const root=new URL('../',import.meta.url);
const [html,css,main]=await Promise.all([
 readFile(new URL('index.html',root),'utf8'),
 readFile(new URL('src/styles.css',root),'utf8'),
 readFile(new URL('src/main.js',root),'utf8')
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
 assert.match(css,/background:var\(--team-color/);
 assert.match(css,/\.colour-swatches\{/);
});
