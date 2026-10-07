// Service worker: salva l'app sul telefono e la apre anche senza internet.
const CACHE = "verbi-v1.0-clean-1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "fonts/figtree-latin-400-normal.woff2", "fonts/figtree-latin-500-normal.woff2", "fonts/figtree-latin-600-normal.woff2", "fonts/newsreader-latin-500-normal.woff2", "fonts/newsreader-latin-600-normal.woff2", "fonts/vazirmatn-arabic-400-normal.woff2", "fonts/vazirmatn-arabic-600-normal.woff2"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("verbi-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  // cache first (apre subito, anche offline); aggiorna in background quando c'è rete
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true }) || (r.mode === "navigate" ? await c.match("index.html") : undefined);
    const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => undefined);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response("Offline", { status: 503, statusText: "Offline" });
  }));
});
