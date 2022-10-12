import { getFirestore } from 'firebase/firestore';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBk-c6CeSm0wBgAzh-Ds7Y07MxLuqfXQ3s",
  authDomain: "hidden-object-game-4771e.firebaseapp.com",
  databaseURL: "https://hidden-object-game-4771e-default-rtdb.firebaseio.com",
  projectId: "hidden-object-game-4771e",
  storageBucket: "hidden-object-game-4771e.appspot.com",
  messagingSenderId: "1006478763638",
  appId: "1:1006478763638:web:f521736cd3285f787b6157"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
