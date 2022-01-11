class Color {
  constructor(r, g, b, a) {
    if (typeof r == 'string' && r[0] == "#") {
      cc = hexToRgb(r);
      g = cc.g;
      b = cc.b;
      a = cc.a;
      r = cc.r;
    } else if (typeof r == 'object' && r.r !== undefined && r.g !== undefined && r.b !== undefined) {
      g = r.g;
      b = r.b;
      a = r.a;
      r = r.r;
    }

    if (!r && r != 0)
      this.r = (Math.random() * 255) | 0;
    else
      this.r = r;

    if (!g && g != 0)
      this.g = (Math.random() * 255) | 0;
    else
      this.g = g;

    if (!b && b != 0)
      this.b = (Math.random() * 255) | 0;
    else
      this.b = b;

    if (a == undefined) {
      this.a = 1;
    } else {
      this.a = a
    }
  }
  toString() {
    return `rgba(${this.r | 0}, ${this.g | 0}, ${this.b | 0}, ${this.a})`;
  }
}

class Circle {
  constructor(props) {
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.size = props.size || 0;
    
    this.color = new Color(props.color)
    this.neighbors = []
  }
  draw(ctx) {
    ctx.lineWidth = 0.01;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = this.color.toString();
    drawCircle(this.x, this.y, this.size, ctx);
    ctx.fillStyle = '#000';
    ctx.stroke();
    // drawCircle(this.x, this.y, 1, ctx);
  }
}
class Worm {
  constructor(props) {
    this.width = props.width || 1;

    this.color = new Color(props.color)

    this.points = [];
    this.points.push({
      x: props.x,
      y: props.y,
      color: this.color
    });

    this.pastOrbits = []

    this.setOrbit(props.orbit);
    
    this.clockwise = props.clockwise;

    this.dead = false;
  }
  setOrbit(orbit) {
    this.orbit = orbit;
    if (orbit) {
      this.pastOrbits.push(orbit);
    }

    this.energy = 0;
  }
  step() {
    if (this.dead || !this.orbit) return;
    let lp = this.points[this.points.length - 1];

    let dv = {
      x: lp.x - this.orbit.x,
      y: lp.y - this.orbit.y,
    }
    let len = dist(dv);

    let a = Math.atan2(dv.y, dv.x);

    
    // let step = 100 * (Math.PI / 64) / Math.pow(len, .5);
    let step = 3;
    let astep = 2 * Math.asin(step / (2 * len) );

    this.energy += astep / (Math.PI * 2);

    if (this.energy > 1) this.energy = 1;
    
    if (this.energy >= 1.00) {
      this.dead = true;
      return;
    }

    if (!this.clockwise) {
      astep *= -1;
    }
    // let step = Math.PI / 64;

    a += astep;

    let newx = Math.cos(a) * len;
    let newy = Math.sin(a) * len;
    let newPoint = {
      x: newx + this.orbit.x,
      y: newy + this.orbit.y,
      color: this.color
    };

    
    this.points.push(newPoint)
  }
  draw(ctx) {
    ctx.lineWidth = 3 * this.energy;
    // ctx.lineWidth = 5;
    ctx.strokeStyle = this.color.toString();
    ctx.lineCap = 'round';
    ctx.beginPath();

    // ctx.moveTo(this.points[0].x, this.points[0].y);

    // this.points.forEach( item => {
    //   ctx.lineTo(item.x, item.y);
    // })

    ctx.moveTo(this.points[this.points.length - 2].x, this.points[this.points.length - 2].y);
    ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);

    ctx.stroke();

    // this.drawLine(ctx)
  }
  drawLine(ctx) {
    let lp = this.points[this.points.length - 1];

    ctx.lineWidth = 2 * this.energy;
    // ctx.lineWidth = 1;
    let len = this.energy * 0.75;

    let grad = ctx.createLinearGradient(lp.x, lp.y, this.orbit.x, this.orbit.y);

    let acol = new Color(this.color);
    acol.a = 0;

    grad.addColorStop(0, acol.toString())
    grad.addColorStop(0.2 * len, this.color.toString())
    grad.addColorStop(0.8 * len, this.orbit.color.toString())
    grad.addColorStop(0.81 * len, '#00000000');

    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(lp.x, lp.y);
    ctx.lineTo(this.orbit.x, this.orbit.y);
    ctx.stroke();
  }
}