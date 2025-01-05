import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB6GKni7uq46C90kXMYMhVa1Pjh0a0CHP4",
  authDomain: "werewolfgamejp-dev.firebaseapp.com",
  databaseURL: "https://werewolfgamejp-dev.firebaseio.com",
  projectId: "werewolfgamejp-dev",
  storageBucket: "werewolfgamejp-dev.appspot.com",
  messagingSenderId: "184611223720",
  appId: "1:184611223720:web:6057985a8bd5b8cf816a9d"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// Function to check if user has admin privileges
export const isAdmin = async () => {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    const idTokenResult = await user.getIdTokenResult();
    return !!idTokenResult.claims.admin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export { app, db, auth };