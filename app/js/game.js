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

var currentHeight = 0; // feet of the character
var time          = 0;
var landings      = [];
var canJump       = true;
// as if in the game.
function drawFloor() {
  ctx.fillStyle = "black"
  ctx.fillRect(0, ctx.canvas.height - TILE_SIZE, ctx.canvas.width, TILE_SIZE)
}

var Molly = {
  height: 0,
  falling: false,
  maxHeight: 0,
  draw: function(){
    if(this.height <  0 || this.height > ctx.canvas.height - TILE_SIZE){
      console.log("drawCharacter oob.");
    }
    if (this.height == 0) {
      Molly.falling = false;
    }
    ctx.fillStyle = "green";
    ctx.fillRect( TILE_SIZE, FLOOR-TILE_SIZE-this.height, TILE_SIZE, TILE_SIZE)
  },
  jump: function(){
    Molly.falling = true;
    this.height += 200
  }
}
function gravity(t, initHeight){
  return -600*Math.pow(t,2) + initHeight;
}

function jump(t, iH) {
  
}

key.pressed.on("space", function(){
  if (Molly.falling || !canJump) {
    return;
  }
  let t = 0;
  let initH = Molly.height;
  canJump = false;
  var air = setInterval(function () {
    t += .02
    Molly.height = gravity(t, 800, initH);
    // if (Molly.height <= 0) {
    //   clearInterval(air)
    //   Molly.height = 0;
    //   canJump = true;
    // }
    // for (var i = 0; i < landings.length; i++) {
    //   if (landings[i].landable  && gravity(time-0.02,800, initH) - gravity(time-0.01,800, initH) > 0) {
    //     Molly.height = landings[i].y;
    //     clearInterval(air);
    //     canJump = true;
    //   }
    // }
  }, 10);
  setTimeout(function () {
    clearInterval(air);
    Molly.height = 0;
    canJump = true;
  }, 1000);
});



var video = document.createElement('video');
video.src = '../assets/sadmachine.mp4';
video.play();

class Landing {
  constructor() {
    this.x = ctx.canvas.width;
    this.y = ctx.canvas.height/2;
    this.l = 400;
    this.s = 3 * Math.random();
    this.landable = false;
  }
  init() {
    // Restart
    if (this.x + this.l < 0) {
      this.x = ctx.canvas.width;
      this.y = (ctx.canvas.height - TILE_SIZE) * Math.random() ;
      this.l = 100 * Math.random() + 200;
      this.s = 3 * Math.random() + 3;
    } else {
      this.x-= this.s;
    }
    if (this.x < 2*TILE_SIZE && 2*TILE_SIZE < this.x + this.l && this.y < Molly.height) {
      this.landable = true;
    } else {
      this.landable = false;
    }
    drawRect(this.x, this.y, this.l);
  }
}

var l1 = new Landing();
var l2 = new Landing();
var l3 = new Landing();
landings = [l1, l2, l3];
function start() {
  let t = 0;
  var animation=window.setInterval(function() {
    ctx.drawImage(video,0, 0, ctx.canvas.width, ctx.canvas.height-TILE_SIZE);
    Molly.draw();
    drawFloor();
    l1.init();
    l2.init();
    l3.init();

    if (Molly.falling) {
      Molly.height = gravity(t, 200);
      t += 0.02
      if (Molly.height <= 0) {
        Molly.height = 0;
        Molly.falling = false;
      }
    } else {
      Molly.falling = false
      t = 0;
    }
  },20);
}
start();

function drawRect(x, height, length) {
  ctx.fillStyle = "black";
  ctx.fillRect(x, FLOOR-height, length, LANDING);
}
