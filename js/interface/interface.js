
function mouseDown(event) {
  //
}
function mouseUp(event) {
  //
} // should be replaced with a better system which I can't remember the name of



class _GUI {
  constructor(spec, container=window) {
    this.container = container;
    this.spec = spec;
    this.canvas = div.appendChild(document.createElement('canvas'));
    this.scaleWidth = spec.scaleWidth
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.viewPortRight = this.canvas.width - this.scaleWidth;
    this.viewPortBottom = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = new _mouseListener(mouseDown, mouseUp);
  }
  // get the scale of the canvas. That is, how much do I need to multiply by to fill the screen from the fft.data
  updateScale() {
    if ((this.canvas.width !== this.container.innerWidth) || (this.canvas.height !== this.container.innerHeight)) {
      this.canvas.width = this.container.innerWidth;
      this.canvas.height = this.container.innerHeight;
      this.viewPortRight = this.canvas.width - this.scaleWidth;
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
  drawCrosshair() {
    if (this.mouse.y < 0 || this.mouse.y > this.viewPortBottom) {
      return "out of bounds";
    }

    this.ctx.strokeStyle = "#ffffff30";
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouse.x, 0);
    this.ctx.lineTo(this.mouse.x, this.canvas.height);
    this.ctx.stroke();

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
  update() {
    this.updateScale();
    if (this.mouse.keys.includes(0)) { // when press LMB
      this.drawCrosshair();
    }
  }
}
