/****************************************************************
FileName: Map.js
Kenneth Drew Gonzales
Pokemon Hope

Description:
This class is used to draw and initilize the map where the
main character will adventure.

A townMap is a small section of the WORLD that the player
will navigate through. My hope is that each townMap will
be loaded individualy.

The viewport is the immediate screen that the user sees
at all times. This view port is made of tiles, 17 wide,
and 13 vertically.

The topleft corner that is walkable is indexed 0,0. so
insertGate
initMap
insertObstruction
insertGate

all follow this convention.
Last Edited: 8/29/16
****************************************************************/

const canvas      = document.getElementById("map");
const ctx         = canvas.getContext("2d");
const key         = require('key-emit')(document);
const ipc         = require('electron').ipcRenderer;

ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

const TILE_SIZE   = 50;
const VIEW_WIDTH  = 16;
const VIEW_HEIGHT = 12;
const LANDING     = 15;
const SPEED       = 7;
const FLOOR       = ctx.canvas.height - TILE_SIZE; // feet of character on ground

var fallAnimation = 0.015;
var gForce = 700;
var currentHeight = 0; // feet of the character
var canJump       = true;
// as if in the game.
function drawFloor() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, ctx.canvas.height - TILE_SIZE, ctx.canvas.width, TILE_SIZE)
}

drawFloor();
drawCharacter(0);
// height above floor feet height
function drawCharacter(height) {
  if(height <  0 || height > ctx.canvas.height - TILE_SIZE){
    height = 0;
  }
  // currentHeight = height;
  ctx.fillStyle = "green";
  ctx.fillRect( TILE_SIZE, FLOOR-TILE_SIZE-height, TILE_SIZE, TILE_SIZE)
}

key.pressed.on("space", function(key_event){
  if (!onGround()) {
    return;
  }
  var time = 0;
  let cleanHeight = 0;
  var init = currentHeight
  var airTime = setInterval(function(){
    cleanHeight = Math.floor(Math.abs(gravity(time-.05) - gravity(time)));

    // Once I land
    if (gravity(time-.05) - gravity(time) > 0 && onGround()) {
      canJump = true;
      clearInterval(airTime);
      currentHeight = gravity(time);
      drawCharacter(currentHeight);
    }

    canJump = false;
    currentHeight = gravity(time) + init;
    drawCharacter(currentHeight);


    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(TILE_SIZE, FLOOR-currentHeight-TILE_SIZE-cleanHeight-1,TILE_SIZE, cleanHeight+1);
    ctx.fillRect(TILE_SIZE, FLOOR-currentHeight,                        TILE_SIZE, cleanHeight); // cover up under it
    ctx.globalCompositeOperation = "source-over";
    drawFloor();
    time += fallAnimation
  }, 10);

  // Clean Memory leak
  setTimeout(function(){
    clearInterval(airTime)
    drawFloor();
    canJump = true;
  }, 1500);
})

function gravity(t) {
  let tempA = -gForce*Math.pow(t,2)+800*t;
  return tempA;
}

function onGround() {
  var bFoot = ctx.getImageData(TILE_SIZE+1, FLOOR-currentHeight+2, 1, 1);
  var backFoot = bFoot.data;

  var fFoot = ctx.getImageData(2*TILE_SIZE-1, FLOOR-currentHeight+2,1,1);
  var frontFoot = fFoot.data;
  // Loop over each pixel and invert the color.
  var back  = backFoot[0] == 0 && backFoot[1] == 0 && backFoot[2] == 0 && backFoot[3] == 0;
  var front = frontFoot[0] == 0 && frontFoot[1] == 0 && frontFoot[2] == 0 && backFoot[3] == 0;
  if (back && front) {  // code for black opaque
    return false;
  }
  return true;
}

function createLanding(timeToLanding, heightAboveGround, length) {
  let w = ctx.canvas.width
  setTimeout(function(){
    let land = setInterval(function(){
      ctx.fillStyle = "black";
      ctx.fillRect(w, FLOOR-heightAboveGround, length, LANDING);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(w+length, FLOOR-heightAboveGround,  TILE_SIZE, LANDING);
      ctx.globalCompositeOperation = "source-over";
      w -= SPEED;
    }, 10)
    setTimeout(function(){
      clearInterval(land);
    }, 100000); // stop watching the landing move.

  }, timeToLanding);
}

for(var i = 0; i < 40; i++){
  createLanding(i*3000, 100, 400);
}

setInterval(function(){
  if (!onGround() && canJump) {
    let time = 0;
    let init = currentHeight;
    var falling = setInterval(function(){
      cleanHeight = Math.floor(Math.abs(fallGravity(time-.05) - fallGravity(time)));

      console.log("I'M FUCKING FALLING");
      currentHeight = fallGravity(time) + init;
      drawCharacter(currentHeight);

      if(onGround()){
        clearInterval(falling);
      }
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(TILE_SIZE, FLOOR-currentHeight-TILE_SIZE-cleanHeight-1,TILE_SIZE, cleanHeight+1);
      ctx.globalCompositeOperation = "source-over";
      drawFloor();
      time += fallAnimation
    }, 10);

    setTimeout(function(){
      canJump = true;
      clearInterval(falling);
    }, 500);
  }
}, 10);

function fallGravity(time) {
  return -gForce*Math.pow(time,2);
}
