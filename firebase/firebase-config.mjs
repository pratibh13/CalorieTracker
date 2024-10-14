// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const { initializeApp } = require("firebase/app");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfNBd8PAAmNsMWsuwDPiQjwQFa_Qc9Wtw",
  authDomain: "rithackathon.firebaseapp.com",
  databaseURL: "https://rithackathon-default-rtdb.firebaseio.com",
  projectId: "rithackathon",
  storageBucket: "rithackathon.appspot.com",
  messagingSenderId: "534455012889",
  appId: "1:534455012889:web:4c6bb25624b7c00299e488",
  measurementId: "G-MGY55WESG5"
  };

// TODO init firebase app once only


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("App: ",app);
console.log("Auth: ",auth);
console.log("DB: ",db);
// Initialize Firebase

export { app, auth, db };
