// Disabled by default. Device access must be configured before any paid request.
import {timingSafeEqual} from 'node:crypto';
const MAX_BYTES=1_000_000;
const windows=new Map();
export default async function handler(req,res){
 res.setHeader?.('Cache-Control','no-store');
 const fail=(status,error)=>res.status(status).json({error});
 if(req.method!=='POST')return fail(405,'Method not allowed.');
 if(process.env.SCOUTLINE_VOICE_TRANSCRIPTION_ENABLED!=='true')return fail(503,'Recorded-note transcription is not enabled. The recording is still saved on your device.');
 const origins=(process.env.SCOUTLINE_VOICE_ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(!origins.includes(req.headers?.origin))return fail(403,'This app address is not authorised for voice transcription.');
 const code=process.env.SCOUTLINE_VOICE_ACCESS_CODE||'',supplied=String(req.headers?.authorization||'').replace(/^Bearer /,'');
 if(code.length<16||Buffer.byteLength(code)!==Buffer.byteLength(supplied)||!timingSafeEqual(Buffer.from(code),Buffer.from(supplied)))return fail(401,'Activate transcription on this device using your private access link or device access code.');
 if(!process.env.OPENAI_API_KEY)return fail(503,'The transcription service is not configured. Your recording is safe on this device.');
 const ip=String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
 const now=Date.now();for(const [key,times] of windows)if(times.at(-1)<now-60000)windows.delete(key);
 const times=(windows.get(ip)||[]).filter(t=>now-t<60000);if(times.length>=12)return fail(429,'Please wait a minute before retrying.');times.push(now);windows.set(ip,times);
 const {audioBase64,mimeType,durationMs}=req.body||{};
 if(typeof durationMs!=='number'||durationMs<=0||durationMs>92000)return fail(400,'Choose a recording of up to 90 seconds.');
 const format=String(mimeType||'').split(';')[0].toLowerCase(),ext={'audio/mp4':'mp4','audio/webm':'webm','audio/ogg':'ogg'}[format];
 if(!ext||typeof audioBase64!=='string'||!audioBase64||!/^[A-Za-z0-9+/]*={0,2}$/.test(audioBase64)||audioBase64.length%4)return fail(400,'The recording format is not supported.');
 if(audioBase64.length>Math.ceil(MAX_BYTES/3)*4)return fail(413,'The recording is too large. Download it and try a shorter note.');
 const bytes=Buffer.from(audioBase64,'base64');
 if(bytes.length<12||bytes.length>MAX_BYTES)return fail(400,'The recording is empty or invalid.');
 const header=bytes.subarray(0,12);
 if(!(ext==='mp4'&&header.subarray(4,8).toString()==='ftyp'||ext==='webm'&&header.subarray(0,4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]))||ext==='ogg'&&header.subarray(0,4).toString()==='OggS'))return fail(400,'The audio file could not be read.');
 const form=new FormData();form.append('model','gpt-transcribe');form.append('file',new Blob([bytes],{type:format}),`scouting-note.${ext}`);form.append('languages[]','en');
 form.append('prompt','A spoken football scouting observation in English. Transcribe the spoken words only; do not invent missing words or commentary.');
 try{
  const upstream=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:form,signal:AbortSignal.timeout(25000)});
  if(!upstream.ok)return fail(502,'Transcription was unavailable. Keep the recording and try again later.');
  const payload=await upstream.json();if(typeof payload.text!=='string'||!payload.text.trim())return fail(422,'No words were returned. Listen to the saved recording before retrying.');
  return res.status(200).json({text:payload.text.trim(),model:'gpt-transcribe'});
 }catch{return fail(502,'Transcription did not finish. Your recording is saved on this device; you can retry.');}
}
