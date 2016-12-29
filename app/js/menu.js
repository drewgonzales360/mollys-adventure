/****************************************************************
Project: Molly's Adventure
FileName: menu.js
Kenneth Drew Gonzales

Description:

Last Edited: 9/6/16
****************************************************************/
const ipcRenderer = require('electron').ipcRenderer
console.log("Menu.js loaded.");

document.getElementById('start').addEventListener('click', function(){
  window.location.href = `file://${__dirname}/../html/level1.html`
});

document.getElementById('end').addEventListener('click', function(){
  ipcRenderer.send('quit');
})
