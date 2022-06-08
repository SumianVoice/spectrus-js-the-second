

navigator.mediaDevices.getUserMedia({ audio: true }).then(spectrum).catch(console.log);

function mainLoop(dt) {
  return;
}

function spectrum(stream) {
  // make the spectrogram
  fft = new _fftData();
  fft.init(stream);
  startLoop(mainLoop);
}
