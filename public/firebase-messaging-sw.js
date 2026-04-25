// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// The config values are injected here or can be hardcoded. For Vite, we might need a dynamic way,
// but usually we rely on query params or a predefined API key. 
// For this tutorial we'll define a placeholder config, which gets replaced if needed.
const firebaseConfig = {
    // These should ideally be set during a build process, but for now we put placeholders.
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Check if trying to fetch config from URL (if we inject dynamically)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_FIREBASE_CONFIG') {
        const config = event.data.config;
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
            const messaging = firebase.messaging();
            
            messaging.onBackgroundMessage((payload) => {
                console.log('[firebase-messaging-sw.js] Received background message ', payload);
                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                    icon: '/images/logo.png'
                };

                self.registration.showNotification(notificationTitle, notificationOptions);
            });
        }
    }
});

// Fallback init if not waiting for message
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        const messaging = firebase.messaging();
        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Received background message ', payload);
            const notificationTitle = payload.notification?.title || 'DairyFresh';
            const notificationOptions = {
                body: payload.notification?.body || 'New Notification',
                icon: '/images/logo.png'
            };
            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    }
} catch (e) {
    console.log("Fallback SW init failed", e);
}
