

class _spectrogram {
  constructor(sampleRate, frequencyBinCount, container=window) {
    this.sampleRate = sampleRate;
    this.frequencyBinCount = frequencyBinCount;
    // by default creates a spectrogram canvas of the full size of the window
    this.canvas = div.appendChild(document.createElement('canvas'));
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    this.pause = false;
    this.colormap = "viridis";
    this.scaleWidth = 100;
    this.viewPortRight = this.canvas.width - this.scaleWidth;
    this.viewPortBottom = this.canvas.height;
    this.scaleMode = "log";
    this.logScale = 1.1;
    this.specMin = 0;
    this.specMax = 10000;
    this.scaleX = 1;
    this.scaleY = 1;
  }
  updateScale() {
    if (this.scaleMode == 'linear') {
      this.scaleX = this.width / this.ahz(this.specMax-this.specMin);
      this.scaleY = this.height / this.ahz(this.specMax-this.specMin);
    }
    else if (this.scaleMode == 'log') {
      const cutoff = this.getBaseLog(Math.ceil(this.ahz(this.specMin)) + 1);
      this.scaleX = this.canvas.width / this.getBaseLog(this.logScale, this.ahz(this.specMax-this.specMin));
      this.scaleY = this.canvas.height / this.getBaseLog(this.logScale, this.ahz(this.specMax-this.specMin));
    }
  }
  clear() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
  }
  getColor(d) {
    if (colormap === undefined) {return `rbg(${d},${d},${d})`}
    return (`rgb(
      ${colormap[this.colormap][d][0]*255},
      ${colormap[this.colormap][d][1]*255},
      ${colormap[this.colormap][d][2]*255})`);
  }
  // draws the spectrogram from data
  draw(data, colormap) {
    if (this.pause) {return "paused"}
    const speed = 500;
    for (var i = 0; i < data.length; i++) {
      this.ctx.fillStyle = this.getColor(data[i]);
      this.ctx.fillRect(this.viewPortRight - speed*dt, this.toScaleY(i), speed*dt, 2);
    }
    return null;
  }
  // takes index and returns its Hz value
  hz(index) {
    return (index / this.frequencyBinCount) * (this.sampleRate/2);
  }
  // converts hz to array position (float)
  ahz(hz) {
    return (hz / (this.sampleRate/2)) * this.frequencyBinCount;
  }
  //
  getBaseLog(number, base) {
    return Math.round(Math.log(number) / Math.log(base)*1000000000)/1000000000;
  }
  //
  unBaseLog(answer, base) {
     return (base ** answer);
  }
  // takes an index and scales it to its Y coordinate
  toScaleY(index) {
      if (this.scaleMode == 'linear') {
        return (index * this.scaleY);
      }
      else if (this.scaleMode == 'log') {
        return this.getBaseLog(this.logScale, index) * this.scaleY;
      }
    }
  // takes a Y value and returns its index in the array
  // undoes scaling
  unScaleY(y) {
    if (this.scaleMode == 'linear') {
      return y / this.scaleY;
    }
    else if (this.scaleMode == 'log') {
      return this.unBaseLog(y / this.scaleY, this.logScale);
    }
  }
}
