'use strict';
const VERSION='afaf24bc557274';
const SCOPE=self.registration.scope;
const PREFIX=`ritmo-shell:${SCOPE}:`;
const CACHE=PREFIX+VERSION;
const FILES=["index.html","editorial.css","dark.css","theme.js","app.js","motion.js","install.js","cloud.js","firebase-config.js","favicon.svg","manifest.webmanifest","vendor/gsap.min.js","vendor/firebase.js","vendor/native.js","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png"].map(path=>new URL(path,SCOPE).href);
const allowed=new Set(FILES);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(url=>new Request(url,{cache:'reload'})))));
  // Activate on the next complete launch, not in the middle of an open form.
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  // Deliberately ignore cross-origin traffic and all Firebase data/auth calls.
  if(url.origin!==self.location.origin||!url.href.startsWith(SCOPE))return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      const stored=await (await caches.open(CACHE)).match(new URL('index.html',SCOPE).href);
      return stored||fetch(request);
    })());return;
  }
  if(!allowed.has(url.href))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const stored=await cache.match(request);
    // Versioned shell assets stay coherent until the next worker activates.
    return stored||fetch(request);
  })());
});
