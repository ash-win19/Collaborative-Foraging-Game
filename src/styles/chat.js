import db from "./firebase.js";
import { doc, updateDoc, getDoc, onSnapshot, arrayUnion } from "firebase/firestore";

const roomId = localStorage.getItem("roomId");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const messagesDiv = document.getElementById("messages");

async function sendMessage() {
    console.log("Send message");
    const user = auth.currentUser;
    if (!user || !roomId) return;
    const message = chatInput.value.trim();
    if (!message) return;

    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
        messages: arrayUnion({ sender: user.displayName, text: message })
    });

    chatInput.value = "";
}

sendChat.addEventListener("click", sendMessage);

// Live Chat Updates
onSnapshot(doc(db, "rooms", roomId), (doc) => {
    const messages = doc.data().messages;
    messagesDiv.innerHTML = messages.map(m => `<p><b>${m.sender}:</b> ${m.text}</p>`).join("");
});