
self.addEventListener('push', function (event) {
    if (!event.data) {
        console.log('Push event but no data')
        return
    }

    try {
        const data = event.data.json()
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            },
            actions: data.actions || []
        }

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        )
    } catch (err) {
        console.error('Error processing push event', err)
    }
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()

    const notificationId = event.notification.data.notificationId

    const trackOpen = async () => {
        if (notificationId) {
            try {
                // Determine origin properly
                const origin = self.location.origin
                await fetch(`${origin}/api/tracking/notification/open`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notificationId })
                })
            } catch (e) {
                console.error('Failed to track notification open', e)
            }
        }
    }

    event.waitUntil(
        Promise.all([
            trackOpen(),
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
                if (clientList.length > 0) {
                    let client = clientList[0]
                    for (let i = 0; i < clientList.length; i++) {
                        if (clientList[i].focused) {
                            client = clientList[i]
                        }
                    }
                    if (event.notification.data.url) {
                        client.navigate(event.notification.data.url)
                    }
                    return client.focus()
                }
                return clients.openWindow(event.notification.data.url || '/')
            })
        ])
    )
})
