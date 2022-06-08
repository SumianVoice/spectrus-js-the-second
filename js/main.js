
// select an input, then start everything
navigator.mediaDevices.getUserMedia({ audio: true }).then(spectrum).catch(console.log);

let fft, gui;

// starts everything after you select an input
function spectrum(stream) {
  // make the spectrogram
  fft = new _fftData();
  fft.init(stream);
  gui = new _GUI(window);
  startLoop(mainLoop);
}

function mainLoop(dt) {
  gui.clear() // clear the gui layer
  // show FPS
  if (dt !== 0) {
    gui.renderText(Math.floor(1/dt), 10, 30, "#fff", "20px", "Mono");
  }
  return;
}
