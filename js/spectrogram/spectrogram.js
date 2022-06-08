

class _spectrogram {
  constructor(fft, container=window) {
    this.fft = fft;
    this.sampleRate = fft.audioCtx.sampleRate;
    this.frequencyBinCount = fft.analyser.fftSize;
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
    this.logScale = 2;
    this.specMin = 0;
    this.specMax = 10000;
    this.scaleX = 1;
    this.scaleY = 1;
    this.speed = 100;
    this.clear();
  }
  // get the scale of the canvas. That is, how much do I need to multiply by to fill the screen from the fft.data
  updateScale() {
    let reDraw = false;
    if ((this.canvas.width !== window.innerWidth) || (this.canvas.height !== window.innerHeight)) {
      this.sampleRate = this.fft.audioCtx.sampleRate;
      this.frequencyBinCount = this.fft.analyser.fftSize;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.viewPortRight = this.canvas.width - this.scaleWidth;
      this.viewPortBottom = this.canvas.height;
      reDraw = true;
    }
    if (this.scaleMode == 'linear') {
      this.scaleX = this.canvas.width / this.indexFromHz(this.specMax);
      this.scaleY = this.canvas.height / this.indexFromHz(this.specMax);
      this.viewPortRight = this.canvas.width - this.scaleWidth;
      this.viewPortBottom = this.canvas.height;
    }
    else if (this.scaleMode == 'log') {
      const cutoff = this.getBaseLog(Math.ceil(this.indexFromHz(this.specMin)) + 1);
      this.scaleX = this.canvas.width / this.getBaseLog(this.indexFromHz(this.specMax), this.logScale);
      this.scaleY = this.canvas.height / this.getBaseLog(this.indexFromHz(this.specMax), this.logScale);
      this.viewPortRight = this.canvas.width - this.scaleWidth;
      this.viewPortBottom = this.canvas.height;
    }
    if (reDraw) {
      this.clear();
      this.drawScale();
    }
  }
  clear() {
    this.ctx.fillStyle = this.getColor(0);
    this.ctx.fillRect(0, 0, this.canvas.width-this.scaleWidth, this.canvas.height);
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
    const width = Math.max(Math.round(this.speed*dt), 1);

    // Move the canvas across a bit to scroll
    this.ctx.translate(-width, 0);
    // Draw the canvas to the side
    this.ctx.drawImage(this.canvas, 0, 0, this.canvas.width-this.scaleWidth, this.canvas.height,
      0, 0, this.canvas.width-this.scaleWidth, this.canvas.height);
    // Reset the transformation matrix.
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);


    // loop through all array position and render each in their proper position
    // for the default setting, this does 8000 or so entries
    for (var i = 1; i < data.length; i++) {
      const tmpY = Math.floor(this.yFromIndex(i));
      const tmpHeight = tmpY - Math.ceil(this.yFromIndex(i-1));
      this.ctx.fillStyle = this.getColor(data[i]);
      this.ctx.fillRect(
        this.viewPortRight - width,
        tmpY,
        width,
        tmpHeight);
    }
    return null;
  }
  renderText(text, x, y, color="#fff", fontsize="20px", font="Mono") {
    this.ctx.font = fontsize + " " + font;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    return true;
  }
  drawScale() {
    this.ctx.clearRect(this.viewPortRight, 0, this.scaleWidth, this.canvas.height);
    if (this.scaleMode === "log") {
      let stepCount = 50;
      // do notes on the scale
      let tmpHZ;
      this.ctx.font = 10 + "px " + "Mono";
      for (var i = 0; i < 12; i++) {
        // A0-A9 note
        tmpHZ = getNoteHz("C"+i);
        this.ctx.fillStyle = `#aa99ff33`; // set color
        this.ctx.fillRect(this.canvas.width - this.scaleWidth, this.yFromIndex(this.indexFromHz(tmpHZ)), 57, 1);
        this.ctx.fillStyle = `#a9f`; // set color
        this.ctx.fillRect(this.canvas.width - this.scaleWidth, this.yFromIndex(this.indexFromHz(tmpHZ)), 5, 1);
        // this.ctx.fillStyle = `#a9f`; // set color
        this.ctx.fillText(`${"C"+i}`, this.canvas.width - this.scaleWidth + 60, this.yFromIndex(this.indexFromHz(tmpHZ)));
      }
      // for (var i = 1; i < Math.floor(this.viewPortBottom / stepCount); i++) {
      //   this.ctx.fillStyle = "#777";
      //   this.ctx.fillRect(this.viewPortRight, (i*stepCount), 20, 1);
      //   this.renderText(Math.floor(this.hzFromY(i*stepCount)), this.viewPortRight, (i*stepCount) - 5, "#444", "15px")
      // }

      for (var i = 1; i < this.canvas.height / stepCount; i++) {
        this.ctx.fillStyle = "#777";
        this.ctx.fillRect(this.viewPortRight, (i*stepCount), 20, 1);
        this.renderText(Math.floor(this.hzFromY(i*stepCount)), this.viewPortRight, (i*stepCount) - 5, "#444", "15px")
      }
      for (var i = 1; i < this.specMax / 100; i++) {
        //
      }
    }
    else if (this.scaleMode === "linear") {
      //
    }
  }
  // takes index and returns its Hz value
  hzFromIndex(index) {
    return (index / this.frequencyBinCount) * (this.sampleRate/2);
  }
  // converts hz to array position (float)
  indexFromHz(hz) {
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
  yFromIndex(index) {
    if (this.scaleMode == 'linear') {
      return this.viewPortBottom - (index * this.scaleY);
    }
    else if (this.scaleMode == 'log') {
      return this.viewPortBottom - (this.getBaseLog(index, this.logScale) * this.scaleY);
    }
  }
  // takes a Y value and returns its index in the array
  // undoes scaling
  indexFromY(y) {
    if (this.scaleMode == 'linear') {
      return (this.viewPortBottom - y) / this.scaleY;
    }
    else if (this.scaleMode == 'log') {
      return this.unBaseLog((this.viewPortBottom - y) / this.scaleY, this.logScale);
    }
  }
  yFromHz(hz) {
    return this.yFromIndex(this.indexFromHz(hz));
  }
  hzFromY(y) {
    return this.hzFromIndex(this.indexFromY(y));
  }
  // try to find the fundamental index
  getFundamental(array) {
    // get highest peak
    let highestPeak = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i] > highestPeak) {
        highestPeak = array[i];
      }
    }
    let peakThreshold = highestPeak * 0.7; // only look at things above this theshold
    let currentPeakIndex = 0;
    let currentPeakAmplitude = 0;
    for (var i = 0; i < array.length; i++) {
      // only look above threshold
      if (array[i] > peakThreshold) {
        // look for peaks
        if (array[i] > currentPeakAmplitude) {
          currentPeakIndex = i;
          currentPeakAmplitude = array[i];
        }
      }
      else if (currentPeakIndex > 0) {
        currentPeakIndex = this.getMoreAccurateFundamental(array, currentPeakIndex);
        return {"index" : currentPeakIndex, "amplitude" : currentPeakAmplitude};
      }
    }
    return {"index" : 0, "amplitude" : 0};
  }
  getMoreAccurateFundamental(array, start) {
    let total = array[start];
    let div = 1;
    for (var i = Math.max(start - 2, 0); i < Math.min(start + 2, array.length-1); i++) {
      if (i != start) {
        total += (array[i]) * i;
        div += (array[i]);
      }
    }
    return (total / div);
  }
}
