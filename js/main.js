
// select an input, then start everything
navigator.mediaDevices.getUserMedia({ audio: true }).then(initialise).catch(console.log);

let fft, gui, spec;

// starts everything after you select an input
function initialise(stream) {
  // make the spectrogram
  fft = new _fftData();
  fft.init(stream);
  spec = new _spectrogram(fft);
  spec.updateScale();
  spec.drawScale();
  gui = new _GUI(window);
  startLoop(mainLoop);
}

function mainLoop(dt) {
  if (dt === 0) { return false } // don't continue if infinite fps
  fft.update();
  gui.clear(); // clear the gui layer
  // show FPS
  gui.renderText(Math.floor(1/dt), 10, 30, "#fff", "20px", "Mono");
  spec.updateScale();
  // spec.drawScale();
  // spec.clear();
  spec.draw(fft.data)
  return;
}
