import test from'node:test';
import assert from'node:assert/strict';
import handler from'../api/extract-lineup.js';

function responseRecorder(){return{statusCode:200,body:null,status(code){this.statusCode=code;return this},json(body){this.body=body;return this}}}

test('rejects lineup extraction when the server key is not configured',async()=>{const previous=process.env.OPENAI_API_KEY;delete process.env.OPENAI_API_KEY;const response=responseRecorder();await handler({method:'POST',body:{}},response);assert.equal(response.statusCode,503);if(previous)process.env.OPENAI_API_KEY=previous});

test('sends an image through the server and returns structured lineup data',async()=>{const previousKey=process.env.OPENAI_API_KEY,previousFetch=global.fetch;process.env.OPENAI_API_KEY='test-key';let requestBody;global.fetch=async(_url,options)=>{requestBody=JSON.parse(options.body);return{ok:true,json:async()=>({model:'test-model',output:[{content:[{type:'output_text',text:JSON.stringify({team:'Forfar',opponent:'Stirling',status:'Confirmed',source:'Official sheet',published:'',starters:[],substitutes:[],uncertainties:[],extractionNotes:[]})}]}]})}};const response=responseRecorder();await handler({method:'POST',body:{imageDataUrl:'data:image/jpeg;base64,AA==',expectedTeam:'Forfar',sourceType:'official paper team sheet'}},response);assert.equal(response.statusCode,200);assert.equal(response.body.lineup.team,'Forfar');assert.equal(requestBody.model,'gpt-5.6-luna');assert.equal(requestBody.text.format.type,'json_schema');assert.equal(requestBody.input[0].content[1].type,'input_image');global.fetch=previousFetch;if(previousKey)process.env.OPENAI_API_KEY=previousKey;else delete process.env.OPENAI_API_KEY});

test('rejects extraction from an origin other than the configured app',async()=>{const previous=process.env.SCOUTLINE_ALLOWED_ORIGIN;process.env.SCOUTLINE_ALLOWED_ORIGIN='https://scoutline.example';const response=responseRecorder();await handler({method:'POST',headers:{origin:'https://other.example'},body:{}},response);assert.equal(response.statusCode,403);if(previous)process.env.SCOUTLINE_ALLOWED_ORIGIN=previous;else delete process.env.SCOUTLINE_ALLOWED_ORIGIN});
