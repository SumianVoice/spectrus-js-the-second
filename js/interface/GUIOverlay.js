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

  drawRuler(x, y, color, width = 1, fullWidth = true) {
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
      this.renderText(
        `${Math.round(getNoteHz(tmpNote, this.notationType))}Hz`,
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
    if (!(this.spec.f[0] > 0)) { return; }
    let tmpColor = '#ffff4480';
    if (this.spec.track.fundamentalAmp > this.spec.track.fundamentalMinAmp) {
      tmpColor = '#22ff55';
    }
    const F0hz = Math.floor(this.spec.hzFromIndex(this.spec.f[0]));
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(
      this.spec.viewPortRight,
      this.spec.yFromIndex(this.spec.f[0]) - 1,
      20,
      2 + 2,
    );
    this.ctx.fillStyle = tmpColor;
    this.ctx.fillRect(
      this.spec.viewPortRight,
      this.spec.yFromIndex(this.spec.f[0]),
      20,
      2,
    );
    this.renderText(
      `${Math.floor(this.spec.hzFromIndex(this.spec.f[0]))}Hz`,
      this.spec.viewPortRight + 20,
      this.spec.yFromIndex(this.spec.f[0]) + 5,
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

  update() {
    this.updateScale();
    this.pitchAlertTest();

    this.notationType = this.audioSystem.spec.notationType;

    if (this.mouse.keys.includes(0)) { // when press LMB
      this.drawRuler(this.mouse.x, this.mouse.y, '#ffff44', 2);
    }
    for (let i = 0; i < this.ruler.length; i++) {
      if (this.ruler[i].active === true) {
        this.drawRuler(this.ruler[i].x, this.ruler[i].y, '#ffaaff', 2);
      }
    }
    this.trackPitch();
  }
}
