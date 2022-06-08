

class _fftData {
  constructor() {
    this.data = false;
    this.timeData = false; // we can't reuse frequency data since it's in decibels
    this.analyser = false;
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048*4;
    this.analyser.smoothingTimeConstant = 0;
  }
  init(stream) {
    this.tmpStream = this.audioCtx.createMediaStreamSource(stream);
    this.audioCtx.createMediaStreamSource(stream).connect(this.analyser);

    this.data = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Float32Array(this.analyser.fftSize);

    this.analyserFrequencyBinCount = this.analyser.frequencyBinCount;
    this.analyserSampleRate = this.audioCtx.sampleRate;
  }
  update() {
    this.analyser.getByteFrequencyData(this.data);
    this.analyser.getFloatTimeDomainData(this.timeData);
  }
}
