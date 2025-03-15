// auth.js
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
//import { app } from "/Users/sheena/Desktop/info research/Collaborative-Foraging-Game/src/firebaseConfig.js"; // Change path 
//import { app } from "../../src/firebaseConfig.js";
import {auth} from "/src/firebaseConfig.js"; // Reference


//const auth = getAuth(auth);
const provider = new GoogleAuthProvider();

// Google Sign-In
document.getElementById("googleSignInBtn").addEventListener("click", () => {
    console.log("test");
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("User signed in:", result.user);
            sessionStorage.setItem("user", JSON.stringify(result.user));
            window.location.href = "lobby.html";  // Redirect to lobby
        })
        .catch((error) => {
            console.error("Error signing in:", error);
        });
});

// Email Sign-Up
// document.getElementById("emailSignUpBtn").addEventListener("click", () => {
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;
    
//     createUserWithEmailAndPassword(auth, email, password)
//         .then((userCredential) => {
//             console.log("User registered:", userCredential.user);
//             localStorage.setItem("user", JSON.stringify(userCredential.user));
//             window.location.href = "lobby.html";
//         })
//         .catch((error) => console.error("Sign-up error:", error));
// });

// // Email Sign-In
// document.getElementById("emailSignInBtn").addEventListener("click", () => {
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;
    
//     signInWithEmailAndPassword(auth, email, password)
//         .then((userCredential) => {
//             console.log("User signed in:", userCredential.user);
//             localStorage.setItem("user", JSON.stringify(userCredential.user));
//             window.location.href = "lobby.html";
//         })
//         .catch((error) => console.error("Sign-in error:", error));
// });

// Guest Login (Assign random username)
document.getElementById("guestLoginBtn").addEventListener("click", () => {
    console.log("guest sing in");
    const guestUser = {
        uid: "guest_" + Math.floor(Math.random() * 10000),
        displayName: "Guest_" + Math.floor(Math.random() * 10000)
    };
    sessionStorage.setItem("user", JSON.stringify(guestUser));
    window.location.href = "lobby.html";
});

// Auto-Redirect if User is Signed In
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "lobby.html";
    }
});