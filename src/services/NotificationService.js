import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase-config.js";

export const NotificationService = {
    async requestPermissionAndGetToken(userEmail) {
        if (!messaging) {
            console.warn("Messaging not initialized.");
            return null;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, { 
                    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
                });
                if (token) {
                    await this.registerDeviceToken(userEmail, token);
                    return token;
                }
            } else {
                console.log('Unable to get permission to notify.');
            }
        } catch (error) {
            console.error('An error occurred while retrieving token. ', error);
        }
        return null;
    },

    setupForegroundListener(onMessageCallback) {
        if (!messaging) return;
        return onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            if (onMessageCallback) {
                onMessageCallback(payload);
            }
        });
    },

    async registerDeviceToken(email, token) {
        const fingerprint = this.getDeviceFingerprint();
        try {
            const resp = await fetch('/api/device/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, fingerprint })
            });
            const data = await resp.json();
            if (data.warning) {
                console.warn(data.warning);
                return data.warning;
            }
        } catch (error) {
            console.error('Failed to register device:', error);
        }
        return null;
    },

    async unregisterDevice(email) {
        const fingerprint = this.getDeviceFingerprint();
        try {
            await fetch('/api/device/unregister', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, fingerprint })
            });
        } catch (error) {
            console.error('Failed to unregister device:', error);
        }
    },

    getDeviceFingerprint() {
        let fp = localStorage.getItem('device_fingerprint');
        if (!fp) {
            fp = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem('device_fingerprint', fp);
        }
        return fp;
    }
};
