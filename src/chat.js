import { db } from "./firebaseConfig.js";
import { doc, updateDoc, getDoc, onSnapshot, arrayUnion } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const auth = getAuth();


// const roomId = localStorage.getItem("roomId");

const chatButton = document.getElementById("chatButton");
const chatbox = document.getElementById("chatbox");
const messageBadge = document.getElementById("messageBadge");
const roomId = sessionStorage.getItem("roomId");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const messagesDiv = document.getElementById("messages"); 
let unreadCount = -1;
chatbox.style.display = "none";
console.log("Script is running..."); 
 
chatButton.addEventListener("click", () => {
    chatbox.style.display = chatbox.style.display === "none" ? "block" : "none";

    if (chatbox.style.display === "block") {
        // Move chatButton to the right of chatbox
        chatButton.style.left = `${chatbox.offsetLeft + chatbox.offsetWidth + 20}px`;
        chatButton.style.bottom = `${chatbox.offsetTop}px`; // Keep it aligned
        messageBadge.innerText = "0"; 
        unreadCount = 0;
        if( unreadCount == 0 ) {
            messageBadge.style.display = "none";
        }
    } else {
        // Move chatButton back to default position
        chatButton.style.left = "40px";
        chatButton.style.bottom = "40px";
    }
});


async function sendMessage(event) {
    console.log("Send message");
    if (event && event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
    }
    // const user = auth.currentUser;  
    const user = JSON.parse(sessionStorage.getItem("user"));  
    if (!user || !roomId) return;
    const message = chatInput.value.trim();
    if (!message) return;
    console.log("user:", user, "message:", message);
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
        messages: arrayUnion({ sender: user.displayName, text: message, timestamp: Date.now() })
    });

    chatInput.value = "";
}
chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); //  Prevents newline in textarea
        sendMessage(event);
    }
});


sendChat.addEventListener("click", sendMessage);

// Live Chat Updates 
onSnapshot(doc(db, "rooms", roomId), (docSnapshot) => {
    if (!docSnapshot.exists()) {
        console.error("Room data not found!");
        return;
    }

    const messages = docSnapshot.data().messages;
    messagesDiv.innerHTML = "";  
 
    const user = JSON.parse(sessionStorage.getItem("user"));

    messages.forEach((m) => {
        const messageWrapper = document.createElement("div");
        messageWrapper.classList.add("message-wrapper");
    
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
    
        const user = JSON.parse(sessionStorage.getItem("user"));
        let senderName = m.sender;
     
        if (user && m.sender === user.displayName) {
            messageDiv.classList.add("sent");
            senderName = "me";
        } else {
            messageDiv.classList.add("received");
        }
     
        const time = new Date(m.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
     
        const timeElement = document.createElement("div");
        timeElement.classList.add("timestamp");
        timeElement.innerText = time;
     
        messageDiv.innerHTML = `<b>${senderName}:</b> ${m.text}`;
     
        messageWrapper.appendChild(timeElement);
        messageWrapper.appendChild(messageDiv);
        messagesDiv.appendChild(messageWrapper);
    });
     
 
    messagesDiv.scrollTop = messagesDiv.scrollHeight;  

    if (chatbox.style.display === "none") {
        console.log("unreadCount: ", unreadCount);
        unreadCount++;
        messageBadge.innerText = unreadCount;
        if (unreadCount != 0) messageBadge.style.display = "block"; 
        console.log("New message received! Unread count:", unreadCount);
    } 
});
