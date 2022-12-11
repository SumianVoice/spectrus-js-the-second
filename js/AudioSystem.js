/** This class generates performs FFT and handles rendering for spectrogram and GUI overlay. */
class AudioSystem { // eslint-disable-line no-unused-vars
  /**
   * Initializes the FFT Analyzer and the UI.
   * @param {HTMLElement} div - The div element to render the key UI.
   * @param {MediaStream} audioStream - The microphone audio stream.
   */
  constructor(div, audioStream) {
    // Initialize FFT.
    this.audioStream = audioStream;
    this.fft = new FFTAnalyser();
    this.fft.init(this.audioStream);

    // Initialize FPS.
    this.avgFPS = 0;

    // Initialize canvases for the display.
    this.div = div;
    this.primaryCanvas = this.div.appendChild(document.createElement('canvas'));
    this.guiCanvas = this.div.appendChild(document.createElement('canvas'));

    // Initialize and draw Spectrogram and GUI overlay.
    this.spec = new Spectrogram(this);
    this.spec.updateScale();
    this.spec.drawScale();
    this.gui = new GUIOverlay(this);
  }

  /**
   * 
   * @param {number} delta Time difference from last frame.
   * @returns {boolean} Success status of the update.
   */
  update(delta) {
    // Abort update if no time has passed.
    if (delta === 0) { return false; }

    // Re-run FFT.
    this.fft.update();    

    // Update average FPS.
    this.avgFPS = ((1 / delta) + this.avgFPS * 19) / 20;  // Calculate average FPS.
    this.gui.clear();
    this.gui.renderText(Math.floor(this.avgFPS), 10, 30, '#ffffff50', '20px', 'Mono');
    this.gui.update();
    
    // Redraw spectrogram.
    this.spec.updateScale();
    this.spec.draw(this.fft.data, delta);

    return true;
  }
}
