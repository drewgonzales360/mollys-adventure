/*******************************************************************************
Project: Molly's Adventure
FileName: antiplur.js
Kenneth Drew Gonzales

Description:
This file will create the enemies that you see on the screen. Just click
them to earn points and make them go away.

*******************************************************************************/
const TILE_SIZE = 50;
/**
 * This is the flying enemy that you'll click to earn points.
 * @param {int} x  x location of upper left corner.
 * @param {int} y  This is the upper left corner y location
 * @param {bool} f This will tell you if the antiplur bounces and flys
 */
function Antiplur(x, y, f){
  this.flyer = f;
  this.x = x;
  this.y = y;
}

/**
 * This function will make the antiplur oscilate up and down, and move it
 * across the screen from right to left.
 * @return
 */
Antiplur.prototype.fly = function (t) {
  this.y += Math.floor(3 * Math.sin(t));
  this.x -= 1;
  if ( this.x < 0) {
    this.x = window.innerWidth;
  }
  if ( this.y < -window.innerHeight || window.innerHeight*2 < this.y) {
    this.y = window.innerHeight/2;
  }
};

Antiplur.prototype.die = function () {
  this.x = window.innerWidth + TILE_SIZE;
};


Antiplur.prototype.shot = function (x,y) {
  if (this.x < x && x < this.x + TILE_SIZE
        && this.y < y && this.y + TILE_SIZE) {
    return true;
  }
  return false;
};

module.exports = Antiplur;
