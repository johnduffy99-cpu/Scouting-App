const PLAYER_SCHEMA={type:'object',additionalProperties:false,properties:{number:{type:'string'},name:{type:'string'},goalkeeper:{type:'boolean'},captain:{type:'boolean'},confidence:{type:'string',enum:['high','medium','low']}},required:['number','name','goalkeeper','captain','confidence']};
const requestWindows=new Map();
const RATE_WINDOW_MS=10*60*1000;
const RATE_LIMIT=12;

function requestIp(request){return String(request.headers?.['x-forwarded-for']||request.socket?.remoteAddress||'unknown').split(',')[0].trim()}
function isRateLimited(request){
 const now=Date.now(),ip=requestIp(request),recent=(requestWindows.get(ip)||[]).filter(time=>now-time<RATE_WINDOW_MS);
 recent.push(now);requestWindows.set(ip,recent);
 return recent.length>RATE_LIMIT;
}
function originAllowed(request){
 const allowed=process.env.SCOUTLINE_ALLOWED_ORIGIN;
 if(!allowed)return true;
 return request.headers?.origin===allowed;
}

export default async function handler(request,response){
 if(request.method!=='POST')return response.status(405).json({error:'Method not allowed'});
 if(!originAllowed(request))return response.status(403).json({error:'This extraction request did not come from the Scoutline app.'});
 if(isRateLimited(request))return response.status(429).json({error:'Too many extraction attempts. Wait ten minutes and try again.'});
 if(!process.env.OPENAI_API_KEY)return response.status(503).json({error:'Automatic extraction is not configured yet.'});
 const{imageDataUrl,expectedTeam='',sourceType='team-sheet'}=request.body||{};
 if(typeof imageDataUrl!=='string'||!/^data:image\/(?:jpeg|png|webp);base64,/i.test(imageDataUrl))return response.status(400).json({error:'Choose a JPEG, PNG or WebP image.'});
 if(imageDataUrl.length>6_000_000)return response.status(413).json({error:'The image is too large. Try a clearer crop of one team sheet.'});
 const schema={type:'object',additionalProperties:false,properties:{team:{type:'string'},opponent:{type:'string'},status:{type:'string'},source:{type:'string'},published:{type:'string'},starters:{type:'array',items:PLAYER_SCHEMA},substitutes:{type:'array',items:PLAYER_SCHEMA},uncertainties:{type:'array',items:{type:'string'}},extractionNotes:{type:'array',items:{type:'string'}}},required:['team','opponent','status','source','published','starters','substitutes','uncertainties','extractionNotes']};
 try{
  const apiResponse=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_LINEUP_MODEL||'gpt-5.6-luna',reasoning:{effort:'low'},input:[{role:'user',content:[{type:'input_text',text:`Extract the football lineup from this ${sourceType}. Expected team if known: ${expectedTeam||'unknown'}. Preserve printed player names and shirt numbers exactly. Identify starters, substitutes, goalkeeper markers and captain markers. Do not guess unreadable text: use an empty number or name fragment and explain it in uncertainties. A lineup graphic may contain both teams; return the team most closely matching the expected team. The scout will review every field before acceptance.`},{type:'input_image',image_url:imageDataUrl,detail:'high'}]}],text:{format:{type:'json_schema',name:'football_lineup',strict:true,schema}}})});
  const payload=await apiResponse.json();
  if(!apiResponse.ok)throw new Error(payload?.error?.message||'OpenAI could not process the image.');
  const outputText=payload.output_text||payload.output?.flatMap(item=>item.content||[]).find(item=>item.type==='output_text')?.text;
  if(!outputText)throw new Error('No lineup was returned from the image.');
  return response.status(200).json({lineup:JSON.parse(outputText),model:payload.model||process.env.OPENAI_LINEUP_MODEL||'gpt-5.6-luna'});
 }catch(error){return response.status(502).json({error:error.message||'Automatic extraction failed.'})}
}
