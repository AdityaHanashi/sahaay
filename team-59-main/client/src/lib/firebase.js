import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDf-8DygVJYgG92s117dqjJ1J5FDkpw1U",
  authDomain: "sahaay-7ab94.firebaseapp.com",
  projectId: "sahaay-7ab94",
  storageBucket: "sahaay-7ab94.firebasestorage.app",
  messagingSenderId: "935494412612",
  appId: "1:935494412612:web:a0c0fb64496dc405ac4f11",
  measurementId: "G-YC6MRPBB2T"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
