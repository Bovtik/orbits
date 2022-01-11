document.addEventListener('DOMContentLoaded', () => {
  //  consts 
  const margin = 20;

  let canvas = document.getElementById('main');
  let ctx = canvas.getContext('2d');
  // ctx.translate(0.5, 0.5);
  let amount = Math.floor(95 * Math.random()) + 5;
  let circles = [];

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height)


  //  Init

  // let pp = poissonDiscSampler(canvas.width, canvas.height, 100 + margin);
  let pp = MitchellsSampler(canvas.width, canvas.height, 100, 100);
  // let mass = 0;
  for (let i = 0; i < amount; i++) {
    let ppp = pp();

    if (!ppp) continue;

    let cc = new Circle({
      x: ppp.x,
      y: ppp.y,
      // size: 10
      // size: ppp.d
    });

    circles.push(cc)
    // cc.draw(ctx);
  }

  console.log(circles);

  circles.forEach( (circle, i, arr) => {
    let closest = arr.reduce( (accum, item) => {
      if (circle != item && dist(circle, item) - item.size < dist(circle, accum) - accum.size) {
        accum = item;
      }

      return accum;
    }, arr[(i + 1) % arr.length])

    circle.size = dist(circle, closest) - margin - closest.size;
    // circle.size = 10;

    if (closest.size == 0) {
      circle.size *= Math.random();
      // circle.noClosest = true;
    }

    // circle.size = 10;
    

    circle.closest = closest;
  })

  //  Need second and third pass to inflate small circles
  circles.forEach( (circle, i, arr) => {
    let closest = arr.reduce((accum, item) => {
      if (circle != item && dist(circle, item) - item.size < dist(circle, accum) - accum.size) {
        accum = item;
      }

      return accum;
    }, arr[(i + 1) % arr.length])

    circle.size = dist(circle, closest) - margin - closest.size;

    circle.closest = closest;
  })
  circles.forEach((circle, i, arr) => {
    let closest = arr.reduce((accum, item) => {
      if (circle != item && dist(circle, item) - item.size < dist(circle, accum) - accum.size) {
        accum = item;
      }

      return accum;
    }, arr[(i + 1) % arr.length])

    circle.size = dist(circle, closest) - margin - closest.size;

    // ctx.lineWidth = circle.size * 0.1;
    // circle.color.a = 0.5;
    // ctx.strokeStyle = circle.color.toString();
    // ctx.beginPath();
    // ctx.moveTo(circle.x, circle.y);
    // ctx.lineTo(closest.x, closest.y);
    // ctx.stroke();

    circle.closest = closest;
  })

  circles.forEach(circle => {
    circle.neighbors = circles.filter(inc => {
      return inc != circle && (dist(circle, inc) - circle.size - inc.size - margin < 0.1);
    })

    // circle.neighbors.forEach( nei => {
    //   ctx.lineWidth = circle.size * 0.1;
    //   // circle.color.a = 0.5;
    //   ctx.strokeStyle = circle.color.toString();
    //   ctx.beginPath();
    //   ctx.moveTo(circle.x, circle.y);
    //   ctx.lineTo(nei.x, nei.y);
    //   ctx.stroke();
    // })
  });

  let worms = [];

  circles.forEach( circle => {
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

    // worm.nextOrbit = circle.neighbors[Math.floor(Math.random() * circle.neighbors.length)];

    worms.push(worm);
  });

  //  Add worm for circle closest to center
  let centerCircle = circles[0];
  let center = {
    x: canvas.width / 2,
    y: canvas.height / 2
  };

  circles.forEach( circle => {
    if (dist(circle, center) < dist(centerCircle, center)) {
      centerCircle = circle;
    }
  })

  let angle = Math.random() * Math.PI * 2;

  let wx = Math.cos(angle) * (centerCircle.size + margin / 2);
  let wy = Math.sin(angle) * (centerCircle.size + margin / 2);

  let centerWorm = new Worm({
    x: wx + centerCircle.x,
    y: wy + centerCircle.y,
    orbit: centerCircle,
    clockwise: (angle < Math.PI)
  })

  worms.push(centerWorm)


  //  Start
  // circles.forEach(circle => circle.draw(ctx));

  let interval = setInterval(() => {
    let allDead = true;
    worms.forEach(worm => {
      allDead = allDead && worm.dead;
      if (worm.dead) return;
      worm.step();
      worm.draw(ctx);
      worm.drawLine(ctx);

      let lp = worm.points[worm.points.length - 1];

      let dv = {
        x: lp.x - worm.orbit.x,
        y: lp.y - worm.orbit.y,
      }

      let variants = worm.orbit.neighbors;
      
      variants.forEach( variant => {
        if (worm.pastOrbits.includes(variant)) {
          return;
        }
        let dv2 = {
          x: lp.x - variant.x,
          y: lp.y - variant.y,
        }

        if (Math.abs((dist(dv) + dist(dv2) - (worm.orbit.size + variant.size + margin))) < 0.1) {
        // if (Math.abs(Math.atan2(dv.y, dv.x) + Math.atan2(dv2.y, dv2.x)) < 0.1) {
          worm.setOrbit(variant);
          worm.clockwise = !worm.clockwise;
        }
      })
    })

    if (allDead) {
      console.log('FINISH')
      clearInterval(interval);
    }
  }, 1000/60);

  let tgl = false;

  canvas.addEventListener('click', e => {
    // let ppp = pp();

    // if (!ppp) return;

    // let cc = new Circle({
    //   x: ppp.x,
    //   y: ppp.y,
    //   size: 10
    //   // size: ppp.d
    // });

    // circles.push(cc)
    // cc.draw(ctx);
    // console.log(worms);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (tgl) {
      circles.forEach(circle => circle.draw(ctx));
    }

    tgl = !tgl;
  })
})

