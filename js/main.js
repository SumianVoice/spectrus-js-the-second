let audioSystem; // eslint-disable-line no-unused-vars

function initialise(stream) { // eslint-disable-line no-unused-vars
  audioSystem = new AudioSystem(document.querySelector('#div'), stream);
  startLoop(audioSystem.update.bind(audioSystem));
}

// select an input, then start everything
// eslint-disable-next-line no-console
navigator.mediaDevices.getUserMedia({ audio: true }).then(initialise).catch(console.error);

//  add spacebar to pause
const spaceBar = 32;
window.onkeydown = (gfg) => {
  if (gfg.keyCode === spaceBar) {
    audioSystem.spec.pauseToggle();
  }
};
