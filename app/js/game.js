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
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

const buffer      = document.createElement("canvas");
const bufctx      = buffer.getContext("2d");
bufctx.canvas.width = window.innerWidth;
bufctx.canvas.height = window.innerHeight;

const key         = require('key-emit')(document);


const TILE_SIZE   = 50;
const LANDING     = 15;
const SPEED       = 7;
const FLOOR       = ctx.canvas.height - TILE_SIZE; // feet of character on ground
const TIME_RATE   = 0.02;
const FRAME_RATE  = 20;
var landings      = [];

var video = document.createElement('video');
video.src = '../assets/sadmachine.mp4';
video.play();
video.muted = true;


var Molly = {
  height: ctx.canvas.height - TILE_SIZE,
  maxHeight: 0,
  landing: -2,
  draw: function(){
    bufctx.fillStyle = "green";
    bufctx.fillRect( TILE_SIZE, FLOOR-TILE_SIZE-this.height, TILE_SIZE, TILE_SIZE)
  }
}
function gravity(t, initHeight){
  return Math.floor(-600*Math.pow(t,2) + initHeight);
}

function jump(t, iH) {
  return Math.floor(-600*Math.pow(t,2) + 800*t + iH);
}



function Landing() {
  this.x = ctx.canvas.width;      // Current x position on viewport
  this.y = ctx.canvas.height/2;   // Current y position on viewport
  this.l = 400;                   // Length of the landing
  this.s = 3 * Math.random();     // Speed of the landing.
  this.landable = false;          // Is the landing beneath me?
  this.floor = false
}

Landing.prototype.init = function () {
  // Restart
  if (this.l + this.x < 0) {
    this.x = ctx.canvas.width;
    this.y = (ctx.canvas.height - TILE_SIZE) * Math.random() ;
    this.l = Math.floor(100 * Math.random()) + 400;
    this.s = Math.floor(2 * Math.random()) + 5;
  } else {
    this.x -= this.s;
  }
  if (this.x <= 2*TILE_SIZE && TILE_SIZE <= this.x + this.l && this.y <= Molly.height) {
    this.landable = true;
  } else {
    this.landable = false;
  }

  // Floor restart
  drawRect(this.x, this.y, this.l);
};

landings = [];
for (var i = 0; i < 8; i++) {
  landings.push(new Landing());
}

function start() {
  myEmitter.emit('fall')
  var animation=window.setInterval(function() {
    bufctx.drawImage(video,0, 0, ctx.canvas.width, ctx.canvas.height);
    Molly.draw();

    for (var i = 0; i < landings.length; i++) {
      landings[i].init();
    }

    ctx.drawImage(buffer, 0, 0);
    if (Molly.landing > -1 && !landings[Molly.landing].landable && closeEnough(Molly.height, landings[Molly.landing].y)) {
      Molly.landing = -1
      console.log("Falling off ledge");
      myEmitter.emit('fall');
    }
    if (video.ended || Molly.height <= 0) {
      clearInterval(animation);
      window.location.href = `file://${__dirname}/../html/menu.html`    }
  },FRAME_RATE);
}
start();

function drawRect(x, height, length) {
  bufctx.fillStyle = "black";
  bufctx.fillRect(x, FLOOR-height, length, LANDING);
}

function closeEnough(molsHeight, y) {
  if (Math.floor(Math.abs(molsHeight-y)) < 10) {
    return true;
  } else {
    return false;
  }
}

myEmitter.on('fall', () => {
  let t = 0;
  let fallin = setInterval(function () {
    Molly.height = gravity(t, Molly.maxHeight);
    t += TIME_RATE;
    for (var i = 0; i < landings.length; i++) {
      if (landings[i].landable && closeEnough(Molly.height, landings[i].y)) {
        Molly.height = landings[i].y;
        Molly.maxHeight = Molly.height;
        Molly.landing = i;
        clearInterval(fallin)
      }
    }
  }, FRAME_RATE);
});

// this function will only handle going up.
key.pressed.on("space", function(){
  if (Molly.landing == -1) {
    return;
  }
  let iHeight = Molly.height;
  Molly.landing = -1
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

key.pressed.on("f", function(){
  if (Molly.landing == -1) {
    return;
  }
  Molly.height -= 6
  myEmitter.emit('fall')

});
