/* NatanXvideos go-shell — cache shell only; NEVER cache link.json */
const CACHE = "nxv-go-shell-v3";
const SHELL = [
  "/go/",
  "/go/index.html",
  "/go/manifest.webmanifest",
  "/go/icon-192.png",
  "/go/icon-512.png",
  "/go/sw.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Never cache the live tunnel pointer
  if (url.pathname.endsWith("/link.json") || url.pathname === "/go/link.json") return;
  if (!url.pathname.startsWith("/go")) return;
  // network-first: always the newest page; cache only when offline
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && SHELL.includes(url.pathname)) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match("/go/index.html")))
  );
});
