class _fftData {
  constructor() {
    this.data = false;
    this.analyser = false;
  }

  init(stream) {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048 * 4;
    this.tmpStream = this.audioCtx.createMediaStreamSource(stream);
    this.audioCtx.createMediaStreamSource(stream).connect(this.analyser);
    this.analyser.smoothingTimeConstant = 0;

    this.data = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyserFrequencyBinCount = this.analyser.frequencyBinCount;
    this.analyserSampleRate = this.audioCtx.sampleRate;
  }

  update() {
    this.analyser.getByteFrequencyData(this.data);
  }
}
