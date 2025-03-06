import { db, auth } from "./firebase.js";  
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";  

async function createRoom() {
    const user = auth.currentUser;
    if (!user) return alert("Login first!");

    const roomId = Math.random().toString(36).substring(2, 8); // Random Room ID
    const roomRef = doc(db, "rooms", roomId);

    await setDoc(roomRef, {
        player1: user.uid,
        player2: null,
        status: "waiting",
        messages: []
    });

    localStorage.setItem("roomId", roomId);
    window.location.href = "game.html"; // Redirect to game
}

async function joinRoom() {
    const user = auth.currentUser;
    const roomId = document.getElementById("roomIdInput").value;
    if (!roomId) return alert("Enter a room ID!");

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return alert("Room not found!");
    if (roomSnap.data().player2) return alert("Room is full!");

    await updateDoc(roomRef, { player2: user.uid, status: "playing" });

    localStorage.setItem("roomId", roomId);
    window.location.href = "game.html"; // Redirect to game
}

document.getElementById("joinRoomBtn").addEventListener("click", joinRoom);
document.getElementById("createRoomBtn").addEventListener("click", createRoom);