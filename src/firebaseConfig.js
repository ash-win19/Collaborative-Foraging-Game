// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
//const app = initializeApp(firebaseConfig);

export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
//export const auth = getAuth(app);