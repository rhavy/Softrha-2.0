/// <reference lib="webworker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

// Evento de install
sw.addEventListener('install', (event) => {
  console.log('[Service Worker] Install', event);
  sw.skipWaiting();
});

// Evento de activate
sw.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate', event);
  sw.clients.claim();
});

// Evento de push notification
sw.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received', event);

  const data = event.data?.json() ?? {
    title: 'SoftRha',
    body: 'Nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  };

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
      timestamp: data.timestamp || Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
      },
      {
        action: 'close',
        title: 'Fechar',
      },
    ],
  };

  event.waitUntil(
    sw.registration.showNotification(data.title, options)
  );
});

// Evento de clique na notificação
sw.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click', event);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      sw.clients.matchAll({ type: 'window' }).then((clients) => {
        // Se já existe uma janela aberta com a URL, focar nela
        const url = event.notification.data?.url || '/dashboard';
        
        for (const client of clients) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Caso contrário, abrir nova janela
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(url);
        }
      })
    );
  }
});

export {};
