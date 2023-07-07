document.addEventListener('contextmenu', (event) => event.preventDefault()); // stop the rightclick menu from showing

class GUIOverlay { // eslint-disable-line no-unused-vars
  constructor(audioSystem, container = window) {
    this.container = container;
    this.audioSystem = audioSystem;
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.viewPortRight = this.canvas.width - this.spec.scaleWidth;
    this.viewPortBottom = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = new MouseListener(this.mouseDown.bind(this), this.mouseUp.bind(this));
    this.ruler = [{ x: 0, y: 0, active: false }];
    this.pitchFloorAlert = document.querySelector('#pitchFloorAlert');
    this.pitchAlert = parseInt(this.pitchFloorAlert.value, 10);
    this.alertSound = new Audio('audio/alert.mp3');
    this.notationType = 'musical';
    this.show_cursor_harmonics = false;
    this.lastAvgWelit = 1;
    this.show_vfvm = false;
  }

  get canvas() {
    return this.audioSystem.guiCanvas;
  }

  get spec() {
    return this.audioSystem.spec;
  }

  pitchAlertTest() {
    const fundamentalHz = this.audioSystem.spec.hzFromIndex(this.audioSystem.spec.f[0]);
    if (this.audioSystem.spec.track.fundamentalAmp
    < this.audioSystem.spec.track.fundamentalMinAmp) { return; }
    this.pitchAlert = parseInt(this.pitchFloorAlert.value, 10);
    if (fundamentalHz < this.pitchAlert) {
      if ((!this.alertSound.duration > 0 || this.alertSound.paused)) {
        this.alertSound.play();
        this.alertSound.currentTime = 0;
      }
    }
  }

  mouseDown(event) {
    if (event.button === 2) {
      if (this.ruler[0].active === true) {
        this.ruler[0].active = false;
      } else {
        this.ruler[0] = { x: this.mouse.x, y: this.mouse.y, active: true };
      }
    }
  }

  mouseUp(event) { // eslint-disable-line no-unused-vars,class-methods-use-this
    //
  } // should be replaced with a better system which I can't remember the name of

  // get the size of the canvas
  updateScale() {
    if (
      (this.canvas.width !== this.container.innerWidth)
      || (this.canvas.height !== this.container.innerHeight)
    ) {
      this.canvas.width = this.container.innerWidth;
      this.canvas.height = this.container.innerHeight;
      this.viewPortRight = this.canvas.width - this.spec.scaleWidth;
      this.viewPortBottom = this.canvas.height;
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderText(text, x, y, color = '#fff', fontsize = '20px', font = 'Mono') {
    this.ctx.font = `${fontsize} ${font}`;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    return true;
  }

  setRuler(x, y) {
    this.ruler[0] = { x, y, active: true };
  }

  disableRuler() {
    this.ruler[0].active = false;
  }

  drawRuler(x, y, color, width = 1, fullWidth = true, harmonics = true) {
    // draw vert line
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = '#ffffff10';
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.stroke();

    // draw horizontal background line
    this.ctx.lineWidth = width + 2;
    this.ctx.strokeStyle = '#111';
    this.ctx.beginPath();
    if (fullWidth === true) {
      this.ctx.moveTo(0, y);
    } else {
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();

    // draw horizontal line
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    if (fullWidth === true) {
      this.ctx.moveTo(0, y);
    } else {
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();

    // draw harmonics
    if (harmonics === true) {
      const hwidth = 150;
      const hoffset = 50;
      for (let i = 2; i < 20; i++) {
        const hzy = i * this.spec.hzFromY(y);
        const posy = this.spec.yFromHz(hzy);
        this.ctx.fillStyle = '#11111144';
        this.ctx.fillRect(x - hwidth + hoffset + 0, posy - 1, hwidth + 2, 2 + 2);
        this.ctx.fillStyle = `${color}80`;
        this.ctx.fillRect(x - hwidth + hoffset + 1, posy, hwidth, 2);
      }
    }

    // Hz render
    this.ctx.fillStyle = '#11111150'; // background for the reading
    this.ctx.fillRect(x + 1, y + 1, 100, 70);
    this.renderText(`${Math.floor(this.spec.hzFromY(y))}Hz`, x + 10, y + 20, color, '20px', 'Mono');
    this.renderText(
      `~${Math.round(((this.viewPortRight - x) / this.spec.speed) * 10) / 10}s`,
      x + 10,
      y + 100,
      '#ffffaa',
      '20px',
      'Mono',
    ); // show time, but it's broken?

    // note render
    // get the note at this position
    const tmpNote = lookupNote(this.spec.hzFromY(y), this.notationType);
    if (tmpNote != '0') { // eslint-disable-line eqeqeq
      // show the note
      this.renderText(
        `${tmpNote}`,
        x + 10,
        y + 40,
        `${color}80`,
        '20px',
        'Mono',
      );
      // show the hz of that note
      const notehz = getNoteHz(tmpNote, this.notationType);
      // let notey = this.spec.yFromHz(notehz)
      // this.ctx.fillStyle = '#11111144';
      // this.ctx.fillRect(x - 50 - 1, notey - 1, 14, 4);
      // this.ctx.fillStyle = '#66aaff';
      // this.ctx.fillRect(x - 50 + 1, notey, 10, 2);
      this.renderText(
        `${Math.round(notehz)}Hz`,
        x + 10,
        y + 60,
        `${color}50`,
        '20px',
        'Mono',
      );
    }
  }

  trackPitch() { // eslint-disable-line consistent-return
    this.spec.update();
    if (!(this.spec.f[0].index > 0)) { return; }
    let tmpColor = '#ffff4480';
    if (this.spec.track.fundamentalAmp > this.spec.track.fundamentalMinAmp) {
      tmpColor = '#22ff55';
    }
    const F0hz = Math.floor(this.spec.hzFromIndex(this.spec.f[0].index));
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(
      this.spec.viewPortRight,
      this.spec.yFromIndex(this.spec.f[0].index) - 1,
      20,
      2 + 2,
    );
    this.ctx.fillStyle = tmpColor;
    this.ctx.fillRect(
      this.spec.viewPortRight,
      this.spec.yFromIndex(this.spec.f[0].index),
      20,
      2,
    );
    this.renderText(
      `${Math.floor(this.spec.hzFromIndex(this.spec.f[0].index))}Hz`,
      this.spec.viewPortRight + 20,
      this.spec.yFromIndex(this.spec.f[0].index) + 5,
      tmpColor,
      '20px',
      'Mono',
    );
    // show the hz and note on the bottom of the screen
    this.renderText(
      `${lookupNote(F0hz, this.notationType)}`,
      10,
      this.spec.viewPortBottom - 40,
      tmpColor,
      '20px',
      'Mono',
    );
    this.renderText(
      `${F0hz}Hz`,
      10,
      this.spec.viewPortBottom - 10,
      tmpColor,
      '20px',
      'Mono',
    );
  }

  harmonicstoggle() {
    this.show_cursor_harmonics = !this.show_cursor_harmonics;
  }

  vfvmtoggle() {
    this.show_vfvm = !this.show_vfvm;
  }

  get_welit() {
    this.ctx.fillStyle = '#22222290';
    this.ctx.fillRect(
      100 - 10,
      this.viewPortBottom - 100 - 30,
      1200,
      100,
    );
    this.renderText(
      'WARNING! Not only is this analysis of vibratory fold mass INACCURATE, even if it were accurate ',
      100,
      this.spec.viewPortBottom - 100,
      '#ffffaa',
      '20px',
      'Mono',
    );
    this.renderText(
      ' basing practice off it is probably useless. Trust your ears, get critique from people.',
      100,
      this.spec.viewPortBottom - 80,
      '#ffffaa',
      '20px',
      'Mono',
    );
    this.renderText(
      'It is based on no empirical data or research and is entirely guesswork.',
      100,
      this.spec.viewPortBottom - 60,
      '#ffffaa',
      '20px',
      'Mono',
    );
    this.renderText(
      'Approx VFVM',
      this.viewPortRight - 500 + 10,
      this.spec.viewPortBottom - 10,
      '#fff',
      '20px',
      'Mono',
    );

    const fundamental = this.audioSystem.spec.track.fundamentalAmp;
    if ((!fundamental) || fundamental < 100) { return; }
    // eslint-disable-line no-undef
    let maxindex = getMaxIndexOverVolume(this.audioSystem.fft.data, 10);
    let f0index = (audioSystem.spec.f[0].index);
    // eslint-disable-line no-undef
    const maxamp = getMaxAmp(this.audioSystem.fft.data);

    if (f0index < 1) {
      f0index = 1;
    }
    if (maxindex < 1) {
      maxindex = f0index;
    }
    const dist = maxindex - f0index;

    const fundamentalRelative = (fundamental / maxamp) ** 2;

    const approxmass = (dist / (f0index / 20)) / fundamentalRelative;
    this.lastAvgWelit = (this.lastAvgWelit * 49 + approxmass) / 50;

    const height = ((this.lastAvgWelit) / 1000) * this.spec.viewPortBottom;

    this.renderText(
      `${Math.ceil(this.lastAvgWelit)} rolloff`,
      100,
      this.spec.viewPortBottom - 10,
      '#fff',
      '20px',
      'Mono',
    );

    this.ctx.fillStyle = '#ffffff90';
    this.ctx.fillRect(
      this.viewPortRight - 500,
      this.viewPortBottom - height * 0.5,
      60,
      height,
    );
  }

  update() {
    this.updateScale();
    this.pitchAlertTest();

    this.notationType = this.audioSystem.spec.notationType;

    if (this.mouse.keys.includes(0)) { // when press LMB
      this.drawRuler(this.mouse.x, this.mouse.y, '#ffff44', 2, true, this.show_cursor_harmonics);
    }
    for (let i = 0; i < this.ruler.length; i++) {
      if (this.ruler[i].active === true) {
        this.drawRuler(this.ruler[i].x, this.ruler[i].y, '#ffaaff', 2, true, this.show_cursor_harmonics);
      }
    }
    this.trackPitch();

    if (this.show_vfvm) {
      this.get_welit();
    }
  }
}
