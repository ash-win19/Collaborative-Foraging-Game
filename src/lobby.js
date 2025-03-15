// lobby.js
import {db} from "./firebaseConfig.js";
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

const user = JSON.parse(sessionStorage.getItem("user"));
if (!user) window.location.href = "index.html";


async function testFirestore() {
    const testRef = doc(db, "testCollection", "testDoc");

    // Write to Firestore
    await setDoc(testRef, { message: "Hello Firestore!" });

    // Read from Firestore
    const docSnap = await getDoc(testRef);
    if (docSnap.exists()) {
        console.log("Firestore is working:", docSnap.data());
    } else {
        console.log("No such document!");
    }
}

testFirestore();


// Create Room
document.getElementById("createRoomBtn").addEventListener("click", async () => {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    await setDoc(doc(db, "rooms", roomId), {
        player1: user.uid,
        player2: null,
        status: "waiting",
        messages: []
    });

    sessionStorage.setItem("roomId", roomId);
    document.getElementById("statusMessage").innerText = `Room Created: ${roomId}`;
    
    // Start listening for changes
    listenForGameStart(roomId);
});

// Join Room
document.getElementById("joinRoomBtn").addEventListener("click", async () => {
    const roomId = document.getElementById("roomIdInput").value.trim();
    if (!roomId) return alert("Enter a valid Room ID");

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return alert("Room does not exist!");
    if (roomSnap.data().player2) return alert("Room is full!");

    // Use updateDoc instead of setDoc for efficiency
    await updateDoc(roomRef, { player2: user.uid, status: "ready" });

    sessionStorage.setItem("roomId", roomId);
    document.getElementById("statusMessage").innerText = `Joined Room: ${roomId}`;

    // Start listening for game start
    listenForGameStart(roomId);
});

// Listen for game start
function listenForGameStart(roomId) {
    const roomRef = doc(db, "rooms", roomId);
    
    onSnapshot(roomRef, (docSnap) => {
        const data = docSnap.data();
        
        if (data.player1 && data.player2 && data.status === "ready") {
            sessionStorage.setItem("gameData", JSON.stringify(data));
            window.location.href = "game.html";
        }
    });
}

// If reloading, ensure listener starts
const savedRoomId = sessionStorage.getItem("roomId");
if (savedRoomId) listenForGameStart(savedRoomId);
