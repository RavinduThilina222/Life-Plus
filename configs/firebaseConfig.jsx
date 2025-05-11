import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvaK0k-Gu51yoT2gjwKZIKZ5TrvYlI9LI",
  authDomain: "lifeplus-6f161.firebaseapp.com",
  projectId: "lifeplus-6f161",
  storageBucket: "lifeplus-6f161.firebasestorage.app",
  messagingSenderId: "284608166144",
  appId: "1:284608166144:web:c6d8988905faa2d0b99be5",
  measurementId: "G-PMJ4PGS6QD"
};

// Initialize Firebase
 export const app = initializeApp(firebaseConfig);
 export const db = getFirestore(app)
// const analytics = getAnalytics(app);