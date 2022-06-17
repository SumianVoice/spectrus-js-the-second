class AudioSystem { // eslint-disable-line no-unused-vars
  constructor(div, audioStream) {
    this.div = div;
    this.audioStream = audioStream;

    this.avgFPS = 0;

    this.fft = new _fftData();
    this.fft.init(this.audioStream);

    this.primaryCanvas = this.div.appendChild(document.createElement('canvas'));
    this.guiCanvas = this.div.appendChild(document.createElement('canvas'));

    this.spec = new _SPECTROGRAM(this);
    this.spec.updateScale();
    this.spec.drawScale();

    this.gui = new _GUI(this);
  }

  update(dt) {
    if (dt === 0) { return false; } // don't continue if infinite fps

    this.fft.update();
    this.gui.clear(); // clear the gui layer
    // show FPS
    this.avgFPS = ((1 / dt) + this.avgFPS * 19) / 20;
    this.gui.renderText(Math.floor(this.avgFPS), 10, this.spec.viewPortBottom - 10, '#fff', '20px', 'Mono');
    this.spec.updateScale();
    // spec.drawScale();
    // spec.clear();
    this.spec.draw(this.fft.data);
    this.gui.update();
    return true;
  }
}
