import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function useWebPush() {
    const { data: session } = useSession()
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isSupported, setIsSupported] = useState(false)
    const [loading, setLoading] = useState(true)
    const [permissionState, setPermissionState] = useState<NotificationPermission>('default')

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            setPermissionState(Notification.permission)
            checkSubscription()
        } else {
            setLoading(false)
        }
    }, [])

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        } catch (error) {
            console.error('Error checking subscription', error)
        } finally {
            setLoading(false)
        }
    }

    const subscribe = async () => {
        setLoading(true)
        try {
            const registration = await navigator.serviceWorker.ready
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

            if (!vapidKey) {
                throw new Error('VAPID public key not found')
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            })

            // Send subscription to server
            await fetch('/api/user/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            })

            setIsSubscribed(true)
            setPermissionState(Notification.permission)
            return true
        } catch (error) {
            console.error('Error subscribing', error)
            return false
        } finally {
            setLoading(false)
        }
    }

    const unsubscribe = async () => {
        setLoading(true)
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
                // Unsubscribe from server first
                await fetch('/api/user/push', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                })

                // Unsubscribe from browser
                await subscription.unsubscribe()
                setIsSubscribed(false)
            }
        } catch (error) {
            console.error('Error unsubscribing', error)
        } finally {
            setLoading(false)
        }
    }

    return {
        isSupported,
        isSubscribed,
        loading,
        permissionState,
        subscribe,
        unsubscribe
    }
}
