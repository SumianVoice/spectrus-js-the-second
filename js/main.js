
// select an input, then start everything
navigator.mediaDevices.getUserMedia({ audio: true }).then(initialise).catch(console.log);

let audioSystem;

function initialise(stream) {
  audioSystem = new AudioSystem(document.querySelector("#div"), stream);
  startLoop(audioSystem.update.bind(audioSystem));
}

//  add spacebar to pause
const space_bar = 32;
window.onkeydown = function(gfg){
  if(gfg.keyCode === space_bar) {
    audioSystem.spec.pauseToggle();
  }
};
