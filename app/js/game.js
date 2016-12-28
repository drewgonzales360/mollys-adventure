/****************************************************************
FileName: Map.js
Kenneth Drew Gonzales
Pokemon Hope

Description:
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
const TIME_RATE   = 0.03;
const FRAME_RATE  = 20;
var landingIndex  = -1 // code for ground.
var landings      = [];
var canJump       = true;
// as if in the game.
function drawFloor() {
  ctx.fillStyle = "black"
  ctx.fillRect(0, ctx.canvas.height - TILE_SIZE, ctx.canvas.width, TILE_SIZE)
}

var Molly = {
  height: 0,
  maxHeight: 0,
  draw: function(){
    if(this.height <  0){
      this.height = 0;
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
    console.log("Cant jump.");
    return;
  }
  canJump = false;
  let iHeight = Molly.height;
  let t = 0;
  let air = setInterval(function () {
    Molly.height = jump(t, iHeight);
    t += TIME_RATE;
    if (t >= 0.6) {
      console.log("Fell from jump.");
      Molly.maxHeight = Molly.height;
      myEmitter.emit('fall')
      clearInterval(air);
    }
  }, FRAME_RATE);
});

var video = document.createElement('video');
video.src = '../assets/sadmachine.mp4';
video.play();
video.muted = true;

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
landings = [l1, l2, l3, l4];

function start() {
  var animation=window.setInterval(function() {
    ctx.drawImage(video,0, 0, ctx.canvas.width, ctx.canvas.height-TILE_SIZE);
    Molly.draw();
    drawFloor();
    l1.init();
    l2.init();
    l3.init();
    l4.init();
    if (landingIndex > -1 && !landings[landingIndex].landable && closeEnough(Molly.height, landings[landingIndex].y)) {
      landingIndex = -2; // code for falling
      console.log("Falling off ledge");
      myEmitter.emit('fall');
    }
    if (video.ended) {
      clearInterval(animation);
      window.location.href = `file://${__dirname}/../html/menu.html`    }
  },FRAME_RATE);
}
start();

function drawRect(x, height, length) {
  ctx.fillStyle = "black";
  ctx.fillRect(x, FLOOR-height, length, LANDING);
}

function closeEnough(molsHeight, y) {
  if (Math.abs(molsHeight-y) < 30) {
    return true;
  } else {
    return false;
  }
}

myEmitter.on('fall', () => {
  let t = 0;
  canJump = false;
  let fallin = setInterval(function () {
    Molly.height = gravity(t, Molly.maxHeight);
    t += TIME_RATE;
    if ( closeEnough(Molly.height, 0)) {
      canJump = true;
      Molly.height = 0;
      landingIndex = -1;
      Molly.maxHeight = 0;
      clearInterval(fallin)
    }
    for (var i = 0; i < landings.length; i++) {
      if (landings[i].landable && closeEnough(Molly.height, landings[i].y)) {
        canJump = true;
        Molly.height = landings[i].y;
        Molly.maxHeight = Molly.height;
        landingIndex = i;
        clearInterval(fallin)
      }
    }
  }, FRAME_RATE);
});
