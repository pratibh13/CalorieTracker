// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const { initializeApp } = require("firebase/app");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyC8ciVcLWr_nWnTBz57XmcWflt7rdEjQxc",
	authDomain: "watsonxtracker.firebaseapp.com",
	projectId: "watsonxtracker",
	storageBucket: "watsonxtracker.appspot.com",
	messagingSenderId: "773768391788",
	appId: "1:773768391788:web:9bd29ba51ecff8be0ffc49",
	measurementId: "G-0MQ0JC9C70"
  };

// TODO init firebase app once only

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
// Initialize Firebase

export { app, auth, db };
