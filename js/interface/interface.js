

class _GUI {
  constructor(container=window) {
    this.canvas = div.appendChild(document.createElement('canvas'));
    this.canvas.width = container.innerWidth;
    this.canvas.height = container.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    
    this.mousePosition = [0, 0];

    document.addEventListener('mousemove', e => {
      let r = this.canvas.getBoundingClientRect();
      let x = e.clientX - r.left;
      let y = e.clientY - r.top;

      this.mousePosition = [x, y];
    });
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
    this.ctx.moveTo(0, this.mousePosition[1]);
    this.ctx.lineTo(this.canvas.width, this.mousePosition[1]);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(this.mousePosition[0], 0);
    this.ctx.lineTo(this.mousePosition[0], this.canvas.height);
    this.ctx.stroke();
  }
  update() {
    this.drawCrosshair();
  }
}
