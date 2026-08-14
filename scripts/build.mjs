import{cp,mkdir,rm}from'node:fs/promises';
const files=['index.html','manifest.webmanifest','icon.svg','sw.js'];
await rm('dist',{recursive:true,force:true});await mkdir('dist/src',{recursive:true});
await Promise.all(files.map(file=>cp(file,`dist/${file}`)));
await cp('src','dist/src',{recursive:true});
console.log('Static production build written to dist/');
