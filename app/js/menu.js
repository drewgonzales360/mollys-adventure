/****************************************************************
FileName: menu.js
Kenneth Drew Gonzales
Material Shot

Description:
The menu will allow a user to pick the difficulty they want
to play the game at. Four levels of difficulty and two game
types.

Accuracy will test a users ability to hit a target with precision,
where the reflex type will test a users ability to quickly hit
larger targets.

Last Edited: 9/6/16
****************************************************************/
const ipcRenderer = require('electron').ipcRenderer
console.log("Menu.js loaded.");
/****************************************************************
getHard
  summary: goes through the radio buttons on the UI and
  retrieves users settings for the game. Then sends the
  settings to the main process.
****************************************************************/
function getHard() {
  var diffRadio = document.getElementsByName('group1');
  let difficulty = "easy"; // default difficulty.
  var typeRadio = document.getElementsByName('game-type');
  let gameType = "easy"; // default gameType.
  for (var i = 0, length = diffRadio.length; i < length; i++) {
    if (diffRadio[i].checked) {
      difficulty = diffRadio[i].value;
      console.log("Difficulty set to " + difficulty);
      console.assert(typeof difficulty === "string")
      break;
    }
  }
  for (var i = 0, length = typeRadio.length; i < length; i++) {
    if (typeRadio[i].checked) {
      // do whatever you want with the checked radio
      gameType = typeRadio[i].value;
      console.log("GameType set to " + gameType);
      console.assert(typeof gameType === "string")
      // only one radio can be logically checked, don't check the rest
      break;
    }
  }
  ipcRenderer.send('game-settings', difficulty, gameType);
}

document.getElementById('start').addEventListener('click', function(){
  // getHard();
  window.location.href = `file://${__dirname}/../html/level1.html`
});

document.getElementById('end').addEventListener('click', function(){
  ipcRenderer.send('quit');
})
