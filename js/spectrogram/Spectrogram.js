function getBaseLog(number, base) {
  return Math.round((Math.log(number) / Math.log(base)) * 1000000000) / 1000000000;
}

function unBaseLog(answer, base) {
  return (base ** answer);
}

function getMoreAccurateFundamental(array, start) {
  let total = array[start];
  let div = 1;
  for (let i = Math.max(start - 2, 0); i < Math.min(start + 2, array.length - 1); i++) {
    if (i !== start) {
      total += (array[i]) * i;
      div += (array[i]);
    }
  }
  return (total / div);
}

function movingAverage(array, span, maxIndex = 1000) {
  const newArray = new Array(Math.min(array.length, maxIndex));
  let tmpCurAvg = 0;
  let totalDiv = 0;
  for (let i = 0; i < Math.min(array.length, maxIndex); i++) {
    totalDiv = 0;
    tmpCurAvg = 0;
    for (let l = i - span; l < i + span; l++) {
      if (l > 0 && l < Math.min(array.length, maxIndex)) {
        tmpCurAvg += array[l];
        totalDiv += 1;
      }
    }
    // tmpCurAvg = (array[i] + tmpCurAvg*span) / (span+1);
    newArray[i] = tmpCurAvg / totalDiv;
  }
  return newArray;
}

function getPeaks(array, baseSegmentSize, logPeaksScale) {
  let segmentSize = baseSegmentSize;
  let curSegment = 1;
  let segmentStart = 0;

  const peaks = new Array(0); // make a blank array for adding to later

  let tmpPeakIndex = 0;
  let tmpPeakValue = 0;
  peaks.push([1, 10]);
  for (let k = 0; k < array.length; k++) {
    // tmpPeakIndex = k;
    if (array[k] >= tmpPeakValue) {
      tmpPeakIndex = k;
      tmpPeakValue = array[k];
    }

    if (k >= segmentStart + segmentSize) { // when you get to the end of the segment
      peaks.push([tmpPeakIndex, tmpPeakValue]);
      // peaks[curSegment][0] = tmpPeakIndex;
      // peaks[curSegment][1] = tmpPeakValue;

      segmentSize = unBaseLog(logPeaksScale, curSegment) * baseSegmentSize;
      segmentStart = k;
      curSegment++;
      tmpPeakValue = 0;
    }
  }
  // console.log(peaks);
  // console.log(segmentSize);
  return peaks;
}

function getFormants(array, formantCount = 3) {
  const newFormants = [[0, 0, 0]];
  for (let i = 0; i < formantCount; i++) {
    newFormants.push([0, 0, 0]);
  }
  // const highestPeak = 0;
  // for (var i = 1; i < array.length; i++) {
  //   if (array[i][1] > highestPeak) {
  //     highestPeak = array[i][1]
  //   }
  // }
  let avgPos = 0;
  // let avgAmp = 0;
  let totalDiv = 0;
  const tmpExp = 40;
  for (let i = 1; i < array.length - 1; i++) {
    // only look at the third formant back
    if (array[i][1] > newFormants[0][1]) {
      if (array[i - 1][1] < array[i][1] && array[i][1] > array[i + 1][1]) {
        // avgAmp = (array[i][1] + array[i - 1][1] + array[i + 1][1]) / 3;
        avgPos = 0;
        totalDiv = 0;
        for (let l = -1; l < 2; l++) {
          avgPos += array[(i + l)][0] * array[i + l][1] ** tmpExp;
          totalDiv += array[i + l][1] ** tmpExp;
        }
        avgPos /= totalDiv;
        newFormants.shift();
        // newFormants.push(array[i]);
        // newFormants.push([array[i][0],avgAmp]);
        newFormants.push([avgPos, array[i][1], 1]);
      }
    }
  }

  // let currentPeak = [0,0];
  // for (var i = 1; i < array.length; i++) {
  //   // only look above threshold
  //   if (array[i][1] > minAmp) {
  //     // look for peaks
  //     if (array[i][1] > currentPeak[1]) {
  //       currentPeak = array[i];
  //     }
  //     else if (array[i][1] < currentPeak[1]*0.3) {
  //       newFormants.shift();
  //       newFormants.push(currentPeak);
  //     }
  //   }
  //   // else if (currentPeakIndex > 0) {
  //   //   return {"index" : currentPeakIndex, "amplitude" : currentPeakAmplitude};
  //   // }
  // }
  //
  return newFormants;
}

class Spectrogram { // eslint-disable-line no-unused-vars
  constructor(audioSystem, container = window) {
    this.audioSystem = audioSystem;
    this.container = container;
    this.sampleRate = this.fft.audioCtx.sampleRate;
    this.frequencyBinCount = this.fft.analyser.fftSize;
    // by default creates a spectrogram canvas of the full size of the window
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    this.pause = false;
    this.colormap = 'viridis';
    this.scaleWidth = 100;
    this.viewPortRight = this.canvas.width - this.scaleWidth;
    this.viewPortBottom = this.canvas.height;
    this.scaleMode = 'log';
    this.logScale = 2;
    this.specMin = 0;
    this.specMax = 15000;
    this.scaleX = 1;
    this.scaleY = 1;
    this.speed = 100;
    this.notationType = 'musical';
    this.track = {
      fundamental: false,
      formants: false,
      formantCount: 3,
      fundamentalMinAmp: 150,
      fundamentalAmp: 0,
    };
    this.f = [{ index: 0, amp: 0, active: false }]; // f0 f1 f2 etc
    for (let i = 0; i < 4; i++) { // add empty slots
      this.f.push({ index: 0, amp: 0, active: false });
    }
    this.formantColors = [
      '#fff', // f0
      '#f3f', // f1
      '#ff1', // f2
      '#6ff', // f3
      '#f22',
      '#ff2',
      '#2f2',
      '#22f',
    ];
    this.clear();
    this.updateScale();
  }

  get canvas() {
    return this.audioSystem.primaryCanvas;
  }

  get fft() {
    return this.audioSystem.fft;
  }

  update() {
    if (this.pause) return;
    this.getFundamental(this.fft.data);
  }

  // get the scale of the canvas.
  // That is, how much do I need to multiply by to fill the screen from the fft.data
  updateScale() {
    let reDraw = false;
    if (
      (this.canvas.width !== this.container.innerWidth)
      || (this.canvas.height !== this.container.innerHeight)
    ) {
      this.sampleRate = this.fft.audioCtx.sampleRate;
      this.frequencyBinCount = this.fft.analyser.fftSize;
      this.canvas.width = this.container.innerWidth;
      this.canvas.height = this.container.innerHeight;
      this.viewPortRight = this.canvas.width - this.scaleWidth;
      this.viewPortBottom = this.canvas.height;
      reDraw = true;
    }
    if (this.scaleMode === 'linear') {
      this.scaleX = this.canvas.width / this.indexFromHz(this.specMax);
      this.scaleY = this.canvas.height / this.indexFromHz(this.specMax);
    } else if (this.scaleMode === 'log') {
      // const cutoff = getBaseLog(Math.ceil(this.indexFromHz(this.specMin)) + 1);
      this.scaleX = this.canvas.width
        / getBaseLog(this.indexFromHz(this.specMax), this.logScale);
      this.scaleY = this.canvas.height
        / getBaseLog(this.indexFromHz(this.specMax), this.logScale);
    }
    if (reDraw) {
      this.clear();
      this.drawScale();
    }
  }

  clear() {
    this.ctx.fillStyle = this.getColor(0);
    this.ctx.fillRect(0, 0, this.canvas.width - this.scaleWidth, this.viewPortBottom);
  }

  getColor(d) {
    if (colormap === undefined) { return `rbg(${d},${d},${d})`; }
    return (`rgb(
      ${colormap[this.colormap][d][0] * 255},
      ${colormap[this.colormap][d][1] * 255},
      ${colormap[this.colormap][d][2] * 255})`);
  }

  // draws the spectrogram from data
  scrollCanvas(width) {
    if (this.pause) return;
    // Move the canvas across a bit to scroll
    // this.ctx.translate(-width, 0);
    // Draw the canvas to the side
    this.ctx.drawImage(
      this.canvas,
      width,
      0,
      this.canvas.width - this.scaleWidth,
      this.canvas.height,
      0,
      0,
      this.canvas.width - this.scaleWidth,
      this.canvas.height,
    );
    // Reset the transformation matrix.
    // this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  plotFormants(data, dt) {
    if (this.pause) return;
    const width = Math.min(Math.max(Math.round(this.speed * dt), 1), 5);
    if (this.track.fundamental === true) {
      if (this.track.fundamentalAmp > this.track.fundamentalMinAmp) {
        this.plot(
          this.viewPortRight - width,
          this.yFromIndex(this.f[0]),
          this.formantColors[0],
          width,
          2,
        );
      }
    }

    if (this.track.formants === true) {
      // formants
      let movAvg = movingAverage(data, 20);
      movAvg = movingAverage(movAvg, 10);
      const movAvgPeaks = getPeaks(movAvg, 6, 1);
      const formants = getFormants(movAvgPeaks, this.track.formantCount);
      // console.log(formants);
      for (let i = 0; i < this.track.formantCount; i++) {
        // eslint-disable-next-line prefer-destructuring
        this.f[i + 1].index = formants[i][0]; // skip 0
        // eslint-disable-next-line prefer-destructuring
        this.f[i + 1].amp = formants[i][1]; // skip 0
        this.f[i + 1].active = true; // skip 0
        this.plot(
          this.viewPortRight - width,
          this.yFromIndex(formants[i][0]),
          this.formantColors[i + 1],
          width,
          2,
        );
      }
    }
  }

  draw(data, dt) {
    if (this.pause) return;
    const width = Math.min(Math.max(Math.round(this.speed * dt), 1), 5);
    this.scrollCanvas(width);
    // loop through all array position and render each in their proper position
    // for the default setting, this does 8000 or so entries
    for (let i = 0; i < data.length - 1; i++) {
      const tmpY = Math.ceil(this.yFromIndex(i));
      // this number will be -1 when the height rounds to 0,
      // because negative number (i-1) is Math.ceil()'d
      const tmpHeight = Math.floor(this.yFromIndex(i + 1)) - tmpY;
      if (tmpHeight === -1) {
        continue;
      }
      this.ctx.fillStyle = this.getColor(data[i]);
      this.ctx.fillRect(
        this.viewPortRight - width,
        tmpY,
        width,
        tmpHeight,
      );
    }
    this.plotFormants(data, dt);
  }

  plot(x, y, color, width, height) {
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, Math.round(y - height / 2) - 1, width, height + 2);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, Math.round(y - height / 2), width, height);
  }

  renderText(text, x, y, color = '#fff', fontsize = '20px', font = 'Mono') {
    this.ctx.font = `${fontsize} ${font}`;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    return true;
  }

  drawScale() {
    this.ctx.clearRect(this.viewPortRight, 0, this.scaleWidth, this.canvas.height);
    let tmpStepDist = 50;

    // ========= notes scale =========
    let tmpHZ;
    this.ctx.font = `${12}px Mono`;
    const A1 = 55;
    for (let i = -1; i < 12; i++) {
      // A0-A9 note
      tmpHZ = (A1 * (2 ** i));
      this.ctx.fillStyle = '#aa99ff33'; // set color
      this.ctx.fillRect(
        this.canvas.width - this.scaleWidth,
        this.yFromIndex(this.indexFromHz(tmpHZ)),
        77,
        1,
      );
      this.ctx.fillStyle = '#a9f'; // set color
      this.ctx.fillRect(
        this.canvas.width - this.scaleWidth,
        this.yFromIndex(this.indexFromHz(tmpHZ)),
        5,
        1,
      );
      // this.ctx.fillStyle = `#a9f`; // set color
      this.ctx.fillText(
        lookupNote(tmpHZ, this.notationType),
        this.canvas.width - this.scaleWidth + 70,
        this.yFromIndex(this.indexFromHz(tmpHZ)),
      );
    }
    // ========= main scale =========
    if (this.scaleMode === 'log') {
      for (let i = 1; i < this.canvas.height / tmpStepDist; i++) {
        this.ctx.fillStyle = '#888';
        this.ctx.fillRect(this.viewPortRight, (i * tmpStepDist), 20, 1);
        this.renderText(
          Math.floor(this.hzFromY(i * tmpStepDist)),
          this.viewPortRight,
          (i * tmpStepDist) - 5,
          '#777',
          '15px',
        );
      }
      // do some manual steps
      const tmpSteps = [100, 500, 1000, 5000, 10000];
      for (let i = 0; i < tmpSteps.length; i++) {
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(this.viewPortRight, this.yFromHz(tmpSteps[i]), 30, 1);
        this.renderText(
          Math.floor(tmpSteps[i]),
          this.viewPortRight + 30,
          this.yFromHz(tmpSteps[i]) + 5,
          '#444',
          '15px',
        );
      }
    } else if (this.scaleMode === 'linear') {
      tmpStepDist = 100; // hz
      for (let i = 0; i < this.specMax / tmpStepDist; i++) {
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(this.viewPortRight, this.yFromHz(i * tmpStepDist), 5, 1);
        // this.renderText(
        //   Math.floor(i*tmpStepDist),
        //   this.viewPortRight,
        //   this.yFromHz(i*tmpStepDist) - 5, "#444", "15px"
        // );
      }
      tmpStepDist = 500; // hz
      for (let i = 0; i < this.specMax / tmpStepDist; i++) {
        this.ctx.fillStyle = '#777';
        this.ctx.fillRect(this.viewPortRight, this.yFromHz(i * tmpStepDist), 10, 1);
        this.renderText(
          Math.floor(i * tmpStepDist),
          this.viewPortRight + 20,
          this.yFromHz(i * tmpStepDist) - 5,
          '#777',
          '15px',
        );
      }
    }
  }

  // takes index and returns its Hz value
  hzFromIndex(index) {
    // this used to divide by 2, and that didn't work in this version but worked in the old version
    // WHAT THE HECK - Sumi
    // Hey Sumi: it's probably because sampleRate is twice fftSize, lol - hle0
    return (index / this.frequencyBinCount) * (this.sampleRate / 1);
  }

  // converts hz to array position (float)
  indexFromHz(hz) {
    return (hz / (this.sampleRate / 1)) * this.frequencyBinCount;
  }

  // takes an index and scales it to its Y coordinate
  yFromIndex(index) {
    if (this.scaleMode === 'linear') {
      return this.viewPortBottom - (index * this.scaleY);
    }
    if (this.scaleMode === 'log') {
      return this.viewPortBottom - (getBaseLog(index, this.logScale) * this.scaleY);
    }
    throw new Error('invalid scale mode');
  }

  // takes a Y value and returns its index in the array
  // undoes scaling
  indexFromY(y) {
    if (this.scaleMode === 'linear') {
      return (this.viewPortBottom - y) / this.scaleY;
    }
    if (this.scaleMode === 'log') {
      return unBaseLog((this.viewPortBottom - y) / this.scaleY, this.logScale);
    }
    throw new Error('invalid scale mode');
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
    // for (var i = 0; i < array.length; i++) { // slow version?
    const tmpMaxCheck = Math.floor(this.indexFromHz(Math.min(5000, array.length)));
    for (let i = 0; i < tmpMaxCheck; i++) { // fast version?
      if (array[i] > highestPeak) {
        highestPeak = array[i];
      }
    }
    const peakThreshold = highestPeak * 0.7; // only look at things above this theshold
    let currentPeakIndex = 0;
    let currentPeakAmplitude = 0;
    for (let i = 0; i < tmpMaxCheck; i++) {
      // only look above threshold
      if (array[i] > peakThreshold) {
        // look for peaks
        if (array[i] > currentPeakAmplitude) {
          currentPeakIndex = i;
          currentPeakAmplitude = array[i];
        }
      } else if (currentPeakIndex > 0) {
        currentPeakIndex = getMoreAccurateFundamental(array, currentPeakIndex);
        if (currentPeakAmplitude > this.track.fundamentalMinAmp) {
          this.f[0] = Math.max(currentPeakIndex, 1);
        }
        this.track.fundamentalAmp = currentPeakAmplitude;
        return { index: Math.max(currentPeakIndex, 1), amp: currentPeakAmplitude };
      }
    }
    return { index: 0, amplitude: 0 };
  }

  specMaxIncrement(amount) {
    this.specMax = Math.min(Math.max(this.specMax + amount, 1000), 15000);
    this.updateScale();
    this.drawScale();
  }

  trackFormantToggle() {
    this.track.fundamental = !this.track.fundamental;
    this.track.formants = !this.track.formants;
  }

  scaleModeToggle() {
    this.scaleMode = this.scaleMode === 'log' ? 'linear' : 'log';
    this.updateScale();
    this.drawScale();
  }

  pauseToggle() {
    this.pause = !this.pause;
  }

  notationToggle() {
    this.notationType = this.notationType === 'experimental' ? 'musical' : 'experimental';
    this.updateScale();
    this.drawScale();
  }
}
