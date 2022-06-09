
function mouseDown(event) {
  //
}
function mouseUp(event) {
  //
} // should be replaced with a better system which I can't remember the name of

let mouse = new _mouseListener(mouseDown, mouseUp);


class _GUI {
  constructor(container=window) {
    this.canvas = div.appendChild(document.createElement('canvas'));
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.ctx = this.canvas.getContext('2d');

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
    this.ctx.moveTo(0, mouse.y);
    this.ctx.lineTo(this.canvas.width, mouse.y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(mouse.x, 0);
    this.ctx.lineTo(mouse.x, this.canvas.height);
    this.ctx.stroke();
  }
  update() {
    this.drawCrosshair();
  }
}
