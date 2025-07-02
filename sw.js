const CACHE_NAME = 'calculator-pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// インストールイベント: アプリケーションシェルをキャッシュする
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // 新しいサービスワーカーがすぐに有効になるように
    );
});

// アクティベートイベント: 古いキャッシュをクリアする
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // サービスワーカーがすぐに制御を開始できるように
    );
});

// フェッチイベント: キャッシュからリソースを提供し、オフラインをサポートする
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにリソースがあればそれを利用
                if (response) {
                    return response;
                }
                // なければネットワークから取得
                return fetch(event.request).then((response) => {
                    // ネットワークエラーの場合
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // レスポンスをキャッシュに追加（今後の利用のため）
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
    );
});
