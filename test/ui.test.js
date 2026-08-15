import test from'node:test';
import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';

const root=new URL('../',import.meta.url);
const [html,css]=await Promise.all([
 readFile(new URL('index.html',root),'utf8'),
 readFile(new URL('src/styles.css',root),'utf8')
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
