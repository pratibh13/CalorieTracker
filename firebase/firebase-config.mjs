// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const { initializeApp } = require("firebase/app");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "*******",
  authDomain: "*****",
  databaseURL: "******",
  projectId: "****",
  storageBucket: "*****",
  messagingSenderId: "******",
  appId: "****",
  measurementId: "*******"
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
