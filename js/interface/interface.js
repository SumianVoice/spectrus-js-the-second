



document.addEventListener('contextmenu', event => event.preventDefault());

class _GUI {
  constructor(spec, container=window) {
    this.container = container;
    this.spec = spec;
    this.canvas = div.appendChild(document.createElement('canvas'));
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.viewPortRight = this.canvas.width - this.spec.scaleWidth;
    this.viewPortBottom = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = new _mouseListener(this.mouseDown.bind(this), this.mouseUp.bind(this));
    this.ruler = [{x:0,y:0,active:false}];
    this.pitchAlert = parseInt(pitchFloorAlert.content);
  }
  mouseDown(event) {
    if (event.button === 2) {
      if (this.ruler[0].active === true) {
        this.ruler[0].active = false;
      }
      else {
        this.ruler[0] = {x:this.mouse.x,y:this.mouse.y,active:true};
      }
    }
  }
  mouseUp(event) {
    //
  } // should be replaced with a better system which I can't remember the name of
  // get the scale of the canvas. That is, how much do I need to multiply by to fill the screen from the fft.data
  updateScale() {
    if ((this.canvas.width !== this.container.innerWidth) || (this.canvas.height !== this.container.innerHeight)) {
      this.canvas.width = this.container.innerWidth;
      this.canvas.height = this.container.innerHeight;
      this.viewPortRight = this.canvas.width - this.spec.scaleWidth;
      this.viewPortBottom = this.canvas.height;
    }
  }
  clear() {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
  }
  renderText(text, x, y, color="#fff", fontsize="20px", font="Mono") {
    this.ctx.font = fontsize + " " + font;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    return true;
  }
  setRuler(x,y) {
    this.ruler[0] = {x:x,y:y,active:true};
  }
  disableRuler() {
    this.ruler.active = false;
  }
  drawCrosshair() {
    if (this.mouse.y < 0 || this.mouse.y > this.viewPortBottom) {
      return "out of bounds";
    }

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#ffffff30";
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouse.x, 0);
    this.ctx.lineTo(this.mouse.x, this.canvas.height);
    this.ctx.stroke();

    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "#222";
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.mouse.y);
    this.ctx.lineTo(this.canvas.width, this.mouse.y);
    this.ctx.stroke();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#fff";
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.mouse.y);
    this.ctx.lineTo(this.canvas.width, this.mouse.y);
    this.ctx.stroke();

      // Hz render
    this.ctx.fillStyle = "#11111150"; // background for the reading
    this.ctx.fillRect(this.mouse.x+1, this.mouse.y+1, 100, 70);
    this.renderText(`${Math.floor(this.spec.hzFromY(this.mouse.y))}Hz`, this.mouse.x + 10, this.mouse.y + 20, "#ffffaa", "20px", "Mono");
    this.renderText(`${Math.round(((this.viewPortRight-this.mouse.x)/this.spec.speed)*10)/10}s`, this.mouse.x + 10, this.mouse.y + 100, "#ffffaa", "20px", "Mono");

      // note render
    const tmpNote = lookupNote(this.spec.hzFromY(this.mouse.y)); // get the note at this position
    if (tmpNote != "0") {
      this.renderText(
        `${tmpNote}`,
        this.mouse.x + 10,
        this.mouse.y + 40,
        "#ffff5550", "20px", "Mono");
      this.renderText(
        `${Math.round(getNoteHz(tmpNote))}Hz`,
        this.mouse.x + 10,
        this.mouse.y + 60,
        "#ffff5550", "20px", "Mono");
    }
  }
  drawRuler(x,y,color,width=1,fullWidth=true) {
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = "#ffffff10";
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height);
    this.ctx.stroke();

    this.ctx.lineWidth = width+2;
    this.ctx.strokeStyle = "#111";
    this.ctx.beginPath();
    if (fullWidth===true) {
      this.ctx.moveTo(0, y);
    }
    else {
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();

    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    if (fullWidth===true) {
      this.ctx.moveTo(0, y);
    }
    else {
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(this.canvas.width, y);
    this.ctx.stroke();


      // Hz render
    this.ctx.fillStyle = "#11111150"; // background for the reading
    this.ctx.fillRect(x+1, y+1, 100, 70);
    this.renderText(`${Math.floor(this.spec.hzFromY(y))}Hz`, x + 10, y + 20, color, "20px", "Mono");
    // this.renderText(`${Math.round(((this.viewPortRight-x)/this.spec.speed)*10)/10}s`, x + 10, y + 100, "#ffffaa", "20px", "Mono");

      // note render
    const tmpNote = lookupNote(this.spec.hzFromY(y)); // get the note at this position
    if (tmpNote != "0") {
      this.renderText(
        `${tmpNote}`,
        x + 10,
        y + 40,
        color + "50", "20px", "Mono");
      this.renderText(
        `${Math.round(getNoteHz(tmpNote))}Hz`,
        x + 10,
        y + 60,
        color + "50", "20px", "Mono");
    }
  }
  update() {
    this.updateScale();
    this.pitchAlert = parseInt(pitchFloorAlert.content);
    if (this.mouse.keys.includes(0)) { // when press LMB
      this.drawRuler(this.mouse.x, this.mouse.y, "#ffff44", 2);
    }
    for (var i = 0; i < this.ruler.length; i++) {
      if (this.ruler[i].active === true) {
        this.drawRuler(this.ruler[i].x, this.ruler[i].y, "#ffaaff", 2);
      }
    }
  }
}
