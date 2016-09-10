
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

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

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

var landingIndex  = -1 // code for ground.
var landings      = [];
var canJump       = true;
var canFall       = false;
// as if in the game.
function drawFloor() {
  ctx.fillStyle = "black"
  ctx.fillRect(0, ctx.canvas.height - TILE_SIZE, ctx.canvas.width, TILE_SIZE)
}

var Molly = {
  height: 0,
  maxHeight: 0,
  draw: function(){
    if(this.height <  0 || this.height > ctx.canvas.height - TILE_SIZE){
      console.log("drawCharacter oob.");
    }
    if (this.height == 0) {
    }
    ctx.fillStyle = "green";
    ctx.fillRect( TILE_SIZE, FLOOR-TILE_SIZE-this.height, TILE_SIZE, TILE_SIZE)
  }
}
function gravity(t, initHeight){
  return -600*Math.pow(t,2) + initHeight;
}

function jump(t, iH) {
  return -600*Math.pow(t,2) + 800*t + iH;
}

// this function will only handle going up.
key.pressed.on("space", function(){
  if (!canJump) {
    return;
  }
  canJump = false;
  let iHeight = Molly.height;
  let t = 0;
  let air = setInterval(function () {
    Molly.height = jump(t, iHeight);
    t += 0.03;
    if (t >= 0.6) {
      Molly.maxHeight = Molly.height;
      myEmitter.emit('fall')
      clearInterval(air);
    }
  }, 20);
});



var video = document.createElement('video');
video.src = '../assets/sadmachine.mp4';
video.play();

class Landing {
  constructor() {
    this.x = ctx.canvas.width;      // Current x position on viewport
    this.y = ctx.canvas.height/2;   // Current y position on viewport
    this.l = 400;                   // Length of the landing
    this.s = 3 * Math.random();     // Speed of the landing.
    this.landable = false;          // Is the landing beneath me?
  }
  init() {
    // Restart
    if (this.x + this.l < 0) {
      this.x = ctx.canvas.width;
      this.y = (ctx.canvas.height - TILE_SIZE) * Math.random() ;
      this.l = 100 * Math.random() + 200;
      this.s = 2 * Math.random() + 5;
    } else {
      this.x -= this.s;
    }
    if (this.x <= 2*TILE_SIZE && TILE_SIZE <= this.x + this.l && this.y <= Molly.height) {
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
var l4 = new Landing();
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
    l4.init();
    if (landingIndex > -1 && !landings[landingIndex].landable) {
      landingIndex = -2; // code for falling
      myEmitter.emit('fall');
    }
  },20);
}
start();

function drawRect(x, height, length) {
  ctx.fillStyle = "black";
  ctx.fillRect(x, FLOOR-height, length, LANDING);
}

function closeEnough(x, y) {
  if (Math.abs(x-y) < 30) {
    return true;
  } else {
    return false;
  }
}

myEmitter.on('fall', () => {
  let t = 0;
  let fallin = setInterval(function () {
    Molly.height = gravity(t, Molly.maxHeight);
    t += 0.03
    if ( closeEnough(Molly.height, 0)) {
      Molly.height = 0;
      landingIndex = -1;
      canJump = true;
      clearInterval(fallin)
    }
    for (var i = 0; i < landings.length; i++) {
      if (landings[i].landable && closeEnough(Molly.height, landings[i].y)) {
        Molly.height = landings[i].y;
        Molly.maxHeight = Molly.height;
        landingIndex = i;
        canJump = true;
        clearInterval(fallin)
      }
    }
  }, 20);
});
