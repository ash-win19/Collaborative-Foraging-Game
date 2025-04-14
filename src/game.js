import { scaleFactor, dialogueData, quizData } from "./constants.js";
import k from "./kaboomCtx.js";
import { displayDialogue, setCamScale } from "./utils.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";

const roomId = sessionStorage.getItem("roomId");
const user = JSON.parse(sessionStorage.getItem("user"));
let gameData;
let previousLevel = null; // Track the previous level to detect changes

// Create Quiz UI (HTML overlay, hidden by default)
const quizUI = document.createElement("div");
quizUI.id = "quiz-ui";
quizUI.style.position = "absolute";
quizUI.style.top = "50%";
quizUI.style.left = "50%";
quizUI.style.transform = "translate(-50%, -50%)";
quizUI.style.background = "rgba(0, 0, 0, 0.8)";
quizUI.style.color = "white";
quizUI.style.padding = "20px";
quizUI.style.borderRadius = "10px";
quizUI.style.display = "none";
quizUI.style.zIndex = "10000"; // Ensure it’s above the game canvas
quizUI.style.fontFamily = "Arial, sans-serif";
quizUI.style.textAlign = "center";
quizUI.innerHTML = `
  <h2 id="quiz-question" style="margin: 0 0 10px 0;"></h2>
  <div id="quiz-options" style="display: flex; flex-wrap: wrap; justify-content: center;"></div>
  <p id="quiz-feedback" style="color: red; margin-top: 10px;"></p>
`;
document.body.appendChild(quizUI);

function showQuiz(level) {
  console.log("Showing quiz for level:", level);
  const quiz = quizData[`level${level}`];
  if (!quiz) {
    console.log("Quiz data not found for level:", level);
    return;
  }

  quizUI.style.display = "block";
  document.getElementById("quiz-question").textContent = quiz.question;
  const optionsDiv = document.getElementById("quiz-options");
  optionsDiv.innerHTML = "";
  quiz.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.style.margin = "5px";
    button.style.padding = "10px";
    button.style.cursor = "pointer";
    button.style.backgroundColor = "#fff";
    button.style.color = "#000";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.onmouseover = () => (button.style.backgroundColor = "#ddd");
    button.onmouseout = () => (button.style.backgroundColor = "#fff");
    button.onclick = () => checkAnswer(option, quiz.correctAnswer, level);
    optionsDiv.appendChild(button);
  });
}

async function checkAnswer(selected, correct, level) {
  const feedback = document.getElementById("quiz-feedback");
  if (selected === correct) {
    feedback.textContent = "Correct!";
    quizUI.style.display = "none";

    // Update Firebase
    const roomRef = doc(db, "rooms", roomId);
    const playerField = user.uid === gameData.player1 ? "player1QuizStatus" : "player2QuizStatus";
    await updateDoc(roomRef, { [playerField]: "solved" });
  } else {
    feedback.textContent = "Incorrect, try again!";
  }
}

onSnapshot(doc(db, "rooms", roomId), (docSnap) => {
  gameData = docSnap.data();
  if (!gameData) {
    console.log("No game data found for roomId:", roomId);
    return;
  }
  console.log("gameData:", gameData); // Debug: Check currentLevel and statuses

  // Check if the level has changed to reload the map
  if (previousLevel !== gameData.currentLevel) {
    console.log(`Level changed from ${previousLevel} to ${gameData.currentLevel}, reloading map...`);
    previousLevel = gameData.currentLevel;

    // Load the new map
    const playerMapImage = user.uid === gameData.player1 ? `playerA-map${gameData.currentLevel}.png` : `playerB-map${gameData.currentLevel}.png`;
    console.log("Loading map image:", playerMapImage); // Debug: Confirm which map is being loaded
    document.getElementById("game").style.backgroundImage = `url('/${playerMapImage}')`;
    k.loadSprite("map", `/${playerMapImage}`);

    const mapFileName = user.uid === gameData.player1 ? `playerA-map${gameData.currentLevel}.json` : `playerB-map${gameData.currentLevel}.json`;
    console.log("Loading map JSON:", mapFileName); // Debug: Confirm which JSON is being loaded
    loadMap(mapFileName);
  }

  // Check if both players solved the quiz to progress to the next level
  if (gameData.player1QuizStatus === "solved" && gameData.player2QuizStatus === "solved") {
    console.log("Both players solved the quiz, progressing to level", gameData.currentLevel + 1);
    const roomRef = doc(db, "rooms", roomId);
    updateDoc(roomRef, {
      currentLevel: gameData.currentLevel + 1,
      player1QuizStatus: "unsolved",
      player2QuizStatus: "unsolved",
    });
  }
});

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.setBackground(k.Color.fromHex("#311047"));

async function loadMap(mapFileName) {
  console.log("in loadMap!!");
  try {
    const response = await fetch(`/${mapFileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load map file: ${mapFileName}`);
    }
    const mapData = await response.json();
    const layers = mapData.layers;

    k.scene("main", async () => {
      const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

      const player = k.make([
        k.sprite("spritesheet", { anim: "idle-down" }),
        k.area({
          shape: new k.Rect(k.vec2(0, 3), 10, 10),
        }),
        k.body(),
        k.anchor("center"),
        k.pos(),
        k.scale(scaleFactor),
        {
          speed: 250,
          direction: "down",
          isInDialogue: false,
        },
        "player",
      ]);

      for (const layer of layers) {
        if (layer.name === "boundaries") {
          for (const boundary of layer.objects) {
            map.add([
              k.area({
                shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
              }),
              k.body({ isStatic: true }),
              k.pos(boundary.x, boundary.y),
              boundary.name,
            ]);

            if (boundary.name === "quiz") {
              // Debug: Visualize the quiz boundary
              map.add([
                k.rect(boundary.width, boundary.height),
                k.color(255, 0, 0), // Red for visibility
                k.pos(boundary.x, boundary.y),
                k.opacity(0.5),
              ]);
              player.onCollide(boundary.name, () => {
                console.log("Collided with quiz boundary!");
                const playerStatus = user.uid === gameData.player1 ? gameData.player1QuizStatus : gameData.player2QuizStatus;
                console.log("isInDialogue:", player.isInDialogue, "playerStatus:", playerStatus);
                if (!player.isInDialogue && playerStatus !== "solved") {
                  player.isInDialogue = true;
                  showQuiz(gameData.currentLevel);
                  player.isInDialogue = false;
                } else {
                  console.log("Quiz not shown due to dialogue or solved status");
                }
              });
            } else if (boundary.name) {
              player.onCollide(boundary.name, () => {
                player.isInDialogue = true;
                displayDialogue(
                  dialogueData[boundary.name],
                  () => (player.isInDialogue = false)
                );
              });
            }
          }
          continue;
        }

        if (layer.name === "spawnpoints") {
          for (const entity of layer.objects) {
            if (entity.name === "player") {
              player.pos = k.vec2(
                (map.pos.x + entity.x) * scaleFactor,
                (map.pos.y + entity.y) * scaleFactor
              );
              k.add(player);
              continue;
            }
          }
        }
      }

      setCamScale(k);

      k.onResize(() => {
        setCamScale(k);
      });

      k.onUpdate(() => {
        k.camPos(player.worldPos().x, player.worldPos().y + 100);
      });

      k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) return;
        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);
        const mouseAngle = player.pos.angle(worldMousePos);
        const lowerBound = 50;
        const upperBound = 125;

        if (mouseAngle > lowerBound && mouseAngle < upperBound && player.curAnim() !== "walk-up") {
          player.play("walk-up");
          player.direction = "up";
          return;
        }
        if (mouseAngle < -lowerBound && mouseAngle > -upperBound && player.curAnim() !== "walk-down") {
          player.play("walk-down");
          player.direction = "down";
          return;
        }
        if (Math.abs(mouseAngle) > upperBound) {
          player.flipX = false;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "right";
          return;
        }
        if (Math.abs(mouseAngle) < lowerBound) {
          player.flipX = true;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "left";
          return;
        }
      });

      function stopAnims() {
        if (player.direction === "down") {
          player.play("idle-down");
          return;
        }
        if (player.direction === "up") {
          player.play("idle-up");
          return;
        }
        player.play("idle-side");
      }

      k.onMouseRelease(stopAnims);
      k.onKeyRelease(() => {
        stopAnims();
      });

      k.onKeyDown((key) => {
        const keyMap = [
          k.isKeyDown("right"),
          k.isKeyDown("left"),
          k.isKeyDown("up"),
          k.isKeyDown("down"),
        ];

        let nbOfKeyPressed = 0;
        for (const key of keyMap) {
          if (key) {
            nbOfKeyPressed++;
          }
        }

        if (nbOfKeyPressed > 1) return;
        if (player.isInDialogue) return;

        if (keyMap[0]) {
          player.flipX = false;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "right";
          player.move(player.speed, 0);
          return;
        }
        if (keyMap[1]) {
          player.flipX = true;
          if (player.curAnim() !== "walk-side") player.play("walk-side");
          player.direction = "left";
          player.move(-player.speed, 0);
          return;
        }
        if (keyMap[2]) {
          if (player.curAnim() !== "walk-up") player.play("walk-up");
          player.direction = "up";
          player.move(0, -player.speed);
          return;
        }
        if (keyMap[3]) {
          if (player.curAnim() !== "walk-down") player.play("walk-down");
          player.direction = "down";
          player.move(0, player.speed);
        }
      });
    });

    k.go("main");
  } catch (error) {
    console.error("Error loading map:", error);
  }
}

document.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    const message = prompt("Enter message:");
    if (!message) return;

    const roomRef = doc(db, "rooms", sessionStorage.getItem("roomId"));
    const roomSnap = await getDoc(roomRef);
    const roomData = roomSnap.data();

    await updateDoc(roomRef, {
      messages: [...roomData.messages, `${user.displayName}: ${message}`],
    });
  }
});