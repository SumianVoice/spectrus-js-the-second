
function mouseDown(event) {
  //
}
function mouseUp(event) {
  //
} // should be replaced with a better system which I can't remember the name of



class _GUI {
  constructor(container=window) {
    this.canvas = div.appendChild(document.createElement('canvas'));
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = new _mouseListener(mouseDown, mouseUp);
    // this.mouse = {
    //   x : 0,
    //   y : 0
    // };
    // document.addEventListener('mousemove', e => {
    //   let r = this.canvas.getBoundingClientRect();
    //   let x = e.clientX - r.left;
    //   let y = e.clientY - r.top;
    //
    //   this.mouse.x = x;
    //   this.mouse.y = y;
    // });
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
    this.ctx.strokeStyle = 'white';

    this.ctx.beginPath();
    this.ctx.moveTo(0, this.mouse.y);
    this.ctx.lineTo(this.canvas.width, this.mouse.y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.mouse.x, 0);
    this.ctx.lineTo(this.mouse.x, this.canvas.height);
    this.ctx.stroke();
    this.renderText(`${Math.floor(spec.hzFromY(this.mouse.y))}Hz`, this.mouse.x, this.mouse.y, "#fff", "20px", "Mono");
  }
  update() {
    if (this.mouse.keys.includes(0)) { // when press LMB
      this.drawCrosshair();
    }
  }
}
