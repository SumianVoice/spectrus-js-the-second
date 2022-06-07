

class _spectrogram {
  constructor() {
    // by default creates a spectrogram canvas of the full size of the window
    this.canvas = div.appendChild(document.createElement('canvas'));
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = canvasUI.getContext('2d');
  }
  // draws the spectrogram from data
  draw(data) {
  }
  // takes index and returns its Hz value
  hz(index) {
    return (0);
  }
  // takes Hz and returns its index in the array
  ahz(hz) {
    return (0);
  }
  // takes an index and scales it to its Y coordinate
  scaleY(index) {
    return (0);
  }
  // takes a Y value and returns its index in the array
  unscaleY(y) {
    return (0);
  }
}
