/*******************************************************************************
Project: Molly's Adventure
FileName: game.js
Kenneth Drew Gonzales

Description:
Holds the game logic.
*******************************************************************************/
const Antiplur = require('./Antiplur');
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
const mouse       = require('mouse-event')

const TILE_SIZE   = 50;
const LANDING     = 15;
const SPEED       = 7;
const FLOOR       = ctx.canvas.height; // feet of character on ground
const TIME_RATE   = 0.02;
const FRAME_RATE  = 10;
var mX = 0;
var mY = 0;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var Molly = {
  x: TILE_SIZE,
  height: ctx.canvas.height - TILE_SIZE,
  maxHeight: 0,
  landing: -2,
  draw: function(){
    bufctx.fillStyle = "green";
    bufctx.fillRect( TILE_SIZE, FLOOR-TILE_SIZE-this.height, TILE_SIZE, TILE_SIZE)
  }
}


var video = document.createElement('video');
video.src = '../assets/sadmachine.mp4';
video.play();
video.muted = true;
var landings = [];
var antiplurs = [];
for (var i = 0; i < 5; i++) {
  antiplurs.push(new Antiplur(700, i*100, true));
}
for (var i = 0; i < 8; i++) {
  landings.push(new Landing());
}
start();

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Draws a lazer to the canvas directly so that it has a cool lazer effect
 * in animation
 * @param  {int} x end point of the lazer
 * @param  {int} y end point of the lazer
 * @return {void}
 */
function drawLazer(x, y) {
  ctx.strokeStyle="#7FFF00";
  ctx.lineWidth=10;
  ctx.beginPath();
  ctx.moveTo(Molly.x + TILE_SIZE/2, (FLOOR - Molly.height) - TILE_SIZE/2);
  ctx.lineTo(x,FLOOR - y);
  ctx.stroke();
}

/**
 * This function handles Falling
 * @param  {int} t          time passed
 * @param  {int} initHeight The initial height
 * @return {int}            resulting height
 */
function gravity(t, initHeight){
  return Math.floor(-600*Math.pow(t,2) + initHeight);
}

/**
 * Handles the math for when the main character jumps and has positive
 * velocity.
 * @param  {int} t  time passed
 * @param  {int} iH initial height
 * @return {int} x returns the height of the faller.
 */
function jump(t, iH) {
  return Math.floor(-600*Math.pow(t,2) + 800*t + iH);
}

/**
 * This object represents the floating platforms that the main character
 * can land on
 * @return {void}
 */
function Landing() {
  this.x = ctx.canvas.width;      // Current x position on viewport
  this.y = ctx.canvas.height/2;   // Current y position on viewport
  this.l = 400;                   // Length of the landing
  this.s = 3 * Math.random();     // Speed of the landing.
  this.landable = false;          // Is the landing beneath me?
  this.floor = false
}

/**
 * Initilizes the landing and allows it to beging moving. Called
 * every frame redraw
 * @return {void}
 */
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

/**
 * Initializes the game and starts the game loop.
 * @return {void}
 */
function start() {
  let t = 0;
  myEmitter.emit('fall')
  let animation=window.setInterval(function() {
    bufctx.drawImage(video,0, 0, ctx.canvas.width, ctx.canvas.height);
    Molly.draw();
    for (let i = 0; i < landings.length; i++) {
      landings[i].init();
    }

    for (let i = 0; i < antiplurs.length; i++) {
      bufctx.fillStyle = "red";
      antiplurs[i].fly(t);
      bufctx.fillRect(antiplurs[i].x, antiplurs[i].y, TILE_SIZE, TILE_SIZE);
    }

    ctx.drawImage(buffer, 0, 0);
    if (Molly.landing > -1 && !landings[Molly.landing].landable && closeEnough(Molly.height, landings[Molly.landing].y)) {
      Molly.landing = -1
      console.log("Falling off ledge");
      myEmitter.emit('fall');
    }
    t += .01;
    if (video.ended || Molly.height <= 0) {
      clearInterval(animation);
      window.location.href = `file://${__dirname}/../html/menu.html`    }
  },FRAME_RATE);
}

/**
 * Draws a rectangle to the buffer context.
 * @param  {int} x      Horizontal location on map
 * @param  {int} height Vertical location on the viewport
 * @param  {int} length Lenght of the platform
 * @return {void}
 */
function drawRect(x, height, length) {
  bufctx.fillStyle = "black";
  bufctx.fillRect(x, FLOOR-height, length, LANDING);
}

/**
 * When two elements are within 10 of each other, return true otherwise
 * return false
 * @param  {int} molsHeight
 * @param  {int} y
 * @return {bool}   True if the elemnts are close enough.
 */
function closeEnough(molsHeight, y) {
  if (Math.floor(Math.abs(molsHeight-y)) < 10) {
    return true;
  } else {
    return false;
  }
}

/**
 * When the main character falls from a jump, or falls off a ledge, this
 * function will handle the falling logic.
 * @type {void}
 */
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

/**
 * When the space bar is pressed, our main character will jump.
 * @type {void}
 */
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

// Turn on the mouse listener for when a shot is fired
window.addEventListener('mousemove', function(ev) {
  mX = mouse.x(ev);
  mY = ctx.canvas.height - mouse.y(ev);
});

/**
 * This will determine if a fired lazer shot hit an antiplurs
 * @type {void}
 */
canvas.addEventListener("click", function () {
  console.log("Shot fired.");
  t = 0;
  let shotx = mX;
  let shoty = mY
  let lazer = setInterval(function () {
    drawLazer(shotx, shoty);
    if (t > 10) {
      clearInterval(lazer);
    }
    t++;
  }, 1);
  for (var i = 0; i < antiplurs.length; i++) {
    if (antiplurs[i].shot(mX, ctx.canvas.height - mY)) {
      antiplurs[i].die();
    }
  }
});
