

class _spectrogram {
  constructor(container=window) {
    // by default creates a spectrogram canvas of the full size of the window
    this.canvas = div.appendChild(document.createElement('canvas'));
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    this.pause;
  }
  // draws the spectrogram from data
  draw(data) {
    if (!this.pause) {return "paused"}
    return null;
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
