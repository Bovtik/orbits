document.addEventListener('DOMContentLoaded', () => {
  //  consts 
  const margin = 20;

  let canvas = document.getElementById('main');
  let ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;


  ctx.strokeStyle = "#f22";
  ctx.lineWidth = 2;

  let mouseDown = false;
  let oldX = null;
  let oldY = null;

  let mouseoutHandler = function mouseoutHandler () {
    mouseDown = false;
    oldX = null;
    oldY = null;
  }
  

  let amount = 100;
  let circles = [];

  let pp = poissonDiscSampler(canvas.width, canvas.height, 100 + margin);
  for (let i = 0; i < amount; i++) {
    let ppp = pp();

    if (!ppp) continue;

    let cc = new Circle({
      x: ppp[0],
      y: ppp[1]
      // x: Math.random() * canvas.width,
      // y: Math.random() * canvas.height,
      // size: 10
    });

    circles.push(cc)

    let mass = circles.reduce( (accum, item) => {
      return accum = accum + (item.size * item.size * Math.PI);
    }, 0)

    let mk = mass / (canvas.width * canvas.height);
    if (mk > 0.25) break;
  }
  
  function minReducer(root, accum, item, i, arr) {
    console.log(accum, item)
    if (dist(root, item) - item.size < dist(root, accum) - accum.size) {
      accum = item;
    }

    return accum;
  }

  circles.forEach( (circle, i, arr) => {
    let closest = arr.reduce( (accum, item) => {
      if (circle != item && dist(circle, item) - item.size < dist(circle, accum) - accum.size) {
        accum = item;
      }

      return accum;
    }, arr[(i + 1) % arr.length])

    circle.size = dist(circle, closest) - margin - closest.size;

    if (closest.size == 0) {
      circle.size *= Math.random();
    }

    circle.closest = closest;

    // ctx.lineWidth = 5;
    // circle.color.a = 0.5;
    // ctx.strokeStyle = circle.color.toString();
    // ctx.beginPath();
    // ctx.moveTo(circle.x, circle.y);
    // ctx.lineTo(closest.x, closest.y);
    // ctx.stroke();

    // circle.size = 15;
  })

  circles.forEach( circle => circle.draw(ctx) );

  let worms = [];

  let bottomCircles = circles
    .filter( circle => {
      return (
        dist(circle, { x: circle.x, y: 0 }) < circle.size ||
        dist(circle, { x: circle.x, y: canvas.height }) < circle.size ||
        dist(circle, { x: 0, y: circle.y }) < circle.size ||
        dist(circle, { x: canvas.width, y: circle.y }) < circle.size
      )
    })
    .map( circle => {
      let clockwise = false;
      let r = circle.size + margin / 2;
      let k = 1;


      if (Math.random() > 0.5) {
        clockwise = true;
        k = -1;
      }

      let wx = 0, wy = 0;

      if (dist(circle, { x: circle.x, y: canvas.height }) < circle.size) {
        wx = k * Math.pow(r * r - Math.pow(circle.y - canvas.height, 2), 0.5) + circle.x;
        wy = canvas.height;
      } else if (dist(circle, { x: circle.x, y: 0 }) < circle.size) {
        wx = -1 * k * Math.pow(r * r - Math.pow(circle.y, 2), 0.5) + circle.x;
        wy = 0;
      } else if (dist(circle, { x: 0, y: circle.y }) < circle.size) {
        wx = 0;
        wy = k * Math.pow(r * r - Math.pow(circle.x, 2), 0.5) + circle.y;
      } else if (dist(circle, { x: canvas.width, y: circle.y }) < circle.size) {
        wx = canvas.width;
        wy = -1 * k * Math.pow(r * r - Math.pow(circle.x - canvas.width, 2), 0.5) + circle.y;
      } else {
        return false
      }

      let worm = new Worm({
        x: wx,
        y: wy,
        orbit: circle,
        clockwise: clockwise
      })

      worms.push(worm);

      return circle;
    });
  
  let interval = setInterval(() => {
    worms.forEach(worm => {
      worm.step();

      worm.draw(ctx);

      let lp = worm.points[worm.points.length - 1];

      let dv = {
        x: lp.x - worm.orbit.x,
        y: lp.y - worm.orbit.y,
      }
      let a = Math.atan2(dv.y, dv.x);

      let dv2 = {
        x: lp.x - worm.orbit.closest.x,
        y: lp.y - worm.orbit.closest.y,
      }
      let b = Math.atan2(dv2.y, dv2.x);
      
      // if (Math.abs(a + b) < 0.01) {
      if ( (dist(dv) + dist(dv2) - (worm.orbit.size + worm.orbit.closest.size + margin)) < 0.1 ) {
        console.log(worm.orbit.closest)
        worm.orbit = worm.orbit.closest;
        worm.clockwise = !worm.clockwise;
      }
    })
  }, 1000/60);
  

  console.log(bottomCircles)

  function clickHandler(e) {
    let mx = e.offsetX;
    let my = e.offsetY;
    let csz = 100;

    let c = new Circle({
      x: mx,
      y: my,
      size: csz
    });

    c.draw(ctx);

    let r = csz + margin / 2;

    let x = -1 * Math.pow(r * r - Math.pow(my - canvas.height, 2), 0.5);

    let worm = new Worm({
      x: mx + x,
      y: canvas.height,
      orbit: c
    })

    // worm.step();
    // worm.step();
    // worm.step();
    // worm.step();
    // worm.step();
    // worm.step();
    // worm.step();
    // worm.step();

    worm.draw(ctx);

    console.log(c, worm)

    setInterval(() => {
      worm.step();
      worm.draw(ctx)
    }, 1000 / 60);
  }

  let tgl = false;

  canvas.addEventListener('click', e => {
    // clickHandler(e);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (tgl) {
      circles.forEach(circle => circle.draw(ctx));
    }

    tgl = !tgl;
  })
})

