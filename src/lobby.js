// lobby.js
import {db} from "./firebaseConfig.js"; 
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, deleteDoc } from "firebase/firestore";

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
    const create_time = new Date(Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
    await setDoc(doc(db, "rooms", roomId), {
        player1: user.uid,
        player2: null,
        status: {
            state: "waiting",
            create_time: create_time,
            join_time: null
        },
        createdAt: Date.now(),
        messages: [],
        player1QuizStatus: "unsolved",
        player2QuizStatus: "unsolved",
        currentLevel: 1
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
    const start_time = new Date(Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) return alert("Room does not exist!");
    if (roomSnap.data().player2) return alert("Room is full!");

    // Use updateDoc instead of setDoc for efficiency 
    await updateDoc(roomRef, { 
        player2: user.uid, 
        status: {
        state: "ready",
        create_time: roomSnap.data().status.create_time,
        join_time: start_time
    } });

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
        console.log("Snapshot data:", data); 
        
        if (data.player1 && data.player2 && data.status.state === "ready") {
            console.log("satidfied");
            sessionStorage.setItem("gameData", JSON.stringify(data));
            window.location.href = "game.html";
        }
    });
}

// If reloading, ensure listener starts
const savedRoomId = sessionStorage.getItem("roomId");
if (savedRoomId) listenForGameStart(savedRoomId);

// window.addEventListener("load", () => {
//     cleanExpiredRooms();
// });

// //clear 
// async function cleanExpiredRooms() {
//     const now = Date.now();
//     const cutoff = now - 48 * 60 * 60 * 1000; // 48 hours in ms

//     const roomsSnapshot = await getDocs(collection(db, "rooms"));
//     for (const docSnap of roomsSnapshot.docs) {
//         const data = docSnap.data();
//         const createdAt = data.createdAt;

//         if (createdAt && now - createdAt > 48 * 60 * 60 * 1000) {
//             await deleteDoc(docSnap.ref);
//             console.log(`Deleted expired room: ${docSnap.id}`);
//         }
//     }
// }