// Firebase initialization (client-side only)
let firebaseApp: any = null

export async function getFirebaseApp() {
  if (firebaseApp) return firebaseApp

  const { initializeApp, getApps, getApp } = await import('firebase/app')

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Check if Firebase is configured
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_firebase_api_key') {
    console.warn('Firebase not configured. Set up Firebase credentials in .env.local')
    return null
  }

  if (typeof window !== 'undefined') {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }

  return firebaseApp
}

export async function getFirestore() {
  const app = await getFirebaseApp()
  if (!app) return null

  const { getFirestore } = await import('firebase/firestore')
  return getFirestore(app)
}

export async function getAuthClient() {
  const app = await getFirebaseApp()
  if (!app) return null

  const { getAuth } = await import('firebase/auth')
  return getAuth(app)
}
