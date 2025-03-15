import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFfHJIEvJen85nz4TN0ymxXKmaeJcPwKU",
  authDomain: "collaborativeforaginggame.firebaseapp.com",
  projectId: "collaborativeforaginggame",
  storageBucket: "collaborativeforaginggame.firebasestorage.app",
  messagingSenderId: "582873355285",
  appId: "1:582873355285:web:815f57b68ee121892faa1c",
  measurementId: "G-1E3BBEV006"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("reached")
const db = getFirestore(app);
console.log("reached2")
const auth = getAuth(app);
//const analytics = getAnalytics(app);
//export const auth = getAuth(app);
//export auth;

export {auth, db};