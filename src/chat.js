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
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
    
        let senderName = m.sender; 
     
        const user = JSON.parse(sessionStorage.getItem("user"));
    
        if (user && m.sender === user.displayName) {
            messageDiv.classList.add("sent");
            senderName = "me";  
        } else {
            messageDiv.classList.add("received");
        }
    
        messageDiv.innerHTML = `<b>${senderName}:</b> ${m.text}`;
        messagesDiv.appendChild(messageDiv);
    });
    
 
    messagesDiv.scrollTop = messagesDiv.scrollHeight;  

    if (chatbox.style.display === "none") {
        console.log("unreadCount: ", unreadCount);
        unreadCount++;
        messageBadge.innerText = unreadCount;
        if (unreadCount != 0) messageBadge.style.display = "block"; // **确保 badge 可见**
        console.log("New message received! Unread count:", unreadCount);
    }
    // 左右对话框 回车键
});
