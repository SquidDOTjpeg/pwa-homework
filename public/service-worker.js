const FILES_TO_CACHE = ["/", "/index.html", "/db.js", "/styles.css"];

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches
        .open(RUNTIME)
        .then((cache) => {
          return fetch(event.request)
            .then((response) => {
              cache.put(event.request.url, response.clone());
              return response;
            })
            .catch((err) => {
              console.log(err);

              return cache.match(event.request);
            });
        })
        .catch((err) => console.log(err))
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
