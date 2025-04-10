
import { scaleFactor, dialogueData } from "./constants.js";
import k from "./kaboomCtx.js";
import { displayDialogue, setCamScale } from "./utils.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { getDoc, updateDoc } from "firebase/firestore";

const roomId = sessionStorage.getItem("roomId");
const user = JSON.parse(sessionStorage.getItem("user"));
let gameData;

onSnapshot(doc(db, "rooms", roomId), (docSnap) => {
    const gameData = docSnap.data();
    if (!gameData) return;

    // const playerMap = user.uid === gameData.player1 ? "map1.png" : "map2.png";
    console.log("gameData", gameData);
    // document.getElementById("game").style.backgroundImage = `url('/assets/maps/${playerMap}')`;

    const playerMapImage = user.uid === gameData.player1 ? "playerA-map1.png" : "playerB-map1.png";
    // document.getElementById("game").style.backgroundImage = `url('/assets/maps/${playerMapImage}')`;
    document.getElementById("game").style.backgroundImage = `url('/${playerMapImage}')`;
    k.loadSprite("map", `/${playerMapImage}`);


    // Load the appropriate map
    const mapFileName = user.uid === gameData.player1 ? "playerA-map1.json" : "playerB-map1.json";
    loadMap(mapFileName);
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

// k.loadSprite("map", "./playerA-map1.png");

k.setBackground(k.Color.fromHex("#311047"));

async function loadMap(mapFileName) {
  console.log("in loadMap!!");
  // const mapData = await (await fetch(`/assets/maps/${mapFileName}`)).json();
  const mapData = await (await fetch(`/${mapFileName}`)).json();

  const layers = mapData.layers;

  k.scene("main", async () => {
    // const mapData = await (await fetch("./playerA-map1.json")).json();
    // const layers = mapData.layers;

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

          if (boundary.name) {
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
      // console.log("Gere");
      // console.log("layer.name :", layer.name );
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

      if (
        mouseAngle > lowerBound &&
        mouseAngle < upperBound &&
        player.curAnim() !== "walk-up"
      ) {
        player.play("walk-up");
        player.direction = "up";
        return;
      }

      if (
        mouseAngle < -lowerBound &&
        mouseAngle > -upperBound &&
        player.curAnim() !== "walk-down"
      ) {
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
}

document.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
      // const message = prompt("Enter message:");
      // if (!message) return;

      const roomRef = doc(db, "rooms", sessionStorage.getItem("roomId"));
      const roomSnap = await getDoc(roomRef);
      const roomData = roomSnap.data();

      await updateDoc(roomRef, {
          messages: [...roomData.messages, `${user.displayName}: ${message}`]
      });
  }
});
