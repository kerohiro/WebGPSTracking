self.addEventListener("install", (event) => {
    console.log("Service Worker installed");
    event.waitUntil(
        caches.open("sensor-logger-cache").then((cache) => {
            return cache.addAll([
                "./main.html",
                "./image/icon-512.png",
                "./logger.js"
            ])
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((res)=> res|| fetch(event.request))
    );
});