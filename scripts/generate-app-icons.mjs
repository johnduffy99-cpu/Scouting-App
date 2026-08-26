import{mkdir,writeFile}from'node:fs/promises';
import{deflateSync}from'node:zlib';

const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0});
function crc32(buffer){let c=0xffffffff;for(const byte of buffer)c=crcTable[(c^byte)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function chunk(type,data){const name=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([length,name,data,crc])}
function png(width,height,pixels){const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;const rows=Buffer.alloc((width*4+1)*height);for(let y=0;y<height;y++){const offset=y*(width*4+1);rows[offset]=0;pixels.copy(rows,offset+1,y*width*4,(y+1)*width*4)}return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))])}
function pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const[a,b]=points[i],[c,d]=points[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside}return inside}
function colourAt(x,y,size){const scale=size/512,px=x/scale,py=y/scale,rounded=Math.hypot(Math.max(Math.abs(px-256)-144,0),Math.max(Math.abs(py-256)-144,0))<=112;if(!rounded)return[0,0,0,0];let colour=[8,19,14,255];const outer=[[256,70],[78,160],[78,352],[256,442],[434,352],[434,160]];const inner=[[256,121],[130,185],[130,327],[256,391],[382,327],[382,185]];if(pointInPolygon(px,py,outer))colour=[50,230,129,255];if(pointInPolygon(px,py,inner))colour=[16,39,27,255];const radius=Math.hypot(px-256,py-256);if(radius>=61&&radius<=79)colour=[50,230,129,255];if((Math.abs(px-256)<=9&&py>=186&&py<=326)||(Math.abs(py-256)<=9&&px>=186&&px<=326))colour=[50,230,129,255];return colour}
function render(size){const samples=2,pixels=Buffer.alloc(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const totals=[0,0,0,0];for(let sy=0;sy<samples;sy++)for(let sx=0;sx<samples;sx++){const c=colourAt(x+(sx+.5)/samples,y+(sy+.5)/samples,size);for(let i=0;i<4;i++)totals[i]+=c[i]}const offset=(y*size+x)*4;for(let i=0;i<4;i++)pixels[offset+i]=Math.round(totals[i]/(samples*samples))}return png(size,size,pixels)}

await mkdir('icons',{recursive:true});
for(const[name,size]of[['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512],['icon-maskable-512.png',512]])await writeFile(`icons/${name}`,render(size));
console.log('Home Screen icons written to icons/');
