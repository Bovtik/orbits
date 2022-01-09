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

    this.orbit = props.orbit;
    this.pastOrbits = []
    
    this.clockwise = props.clockwise;
  }
  setOrbit(orbit) {
    this.orbit = orbit;
  }
  step() {
    let lp = this.points[this.points.length - 1];

    let dv = {
      x: lp.x - this.orbit.x,
      y: lp.y - this.orbit.y,
    }
    let len = dist(dv);

    let a = Math.atan2(dv.y, dv.x);

    
    // let step = 100 * (Math.PI / 64) / Math.pow(len, .5);
    let step = 5;
    let astep = 2 * Math.asin(step / (2 * len) );

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
    ctx.lineWidth = 10;
    ctx.strokeStyle = this.color.toString();
    ctx.lineCap = 'round';
    ctx.beginPath();

    ctx.moveTo(this.points[0].x, this.points[0].y);

    this.points.forEach( item => {
      ctx.lineTo(item.x, item.y);
    })

    ctx.stroke();
  }
}