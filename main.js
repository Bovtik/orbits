

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
  canvas.addEventListener('click', (e) => {
    let mx = e.offsetX;
    let my = e.offsetY;

    let c = new Circle({
      x: mx,
      y: my,
      size: 100
    });

    c.draw(ctx);
  })

  let amount = 100;
  let circles = [];

  let pp = poissonDiscSampler(canvas.width, canvas.height, 100);
  for (let i = 0; i < 100; i++) {
    let ppp = pp();
    console.log(ppp)

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
    console.log(mass, mk)
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
    // let closest = arr[0];
    console.log(dist(arr[0], arr[2]))

    let closest = arr.reduce( (accum, item) => {
      if (circle != item && dist(circle, item) - item.size < dist(circle, accum) - accum.size) {
        accum = item;
      }

      return accum;
    }, arr[(i + 1) % arr.length])

    console.log(closest)

    circle.size = dist(circle, closest) - margin - closest.size;

    if (closest.size == 0) {
      circle.size *= Math.random();
    }

    ctx.lineWidth = 5;
    circle.color.a = 0.5;
    ctx.strokeStyle = circle.color.toString();
    ctx.beginPath();
    ctx.moveTo(circle.x, circle.y);
    ctx.lineTo(closest.x, closest.y);
    ctx.stroke();

    // circle.size = 15;
  })

  circles.forEach( circle => circle.draw(ctx) );

  canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
  })
  canvas.addEventListener('mouseup', mouseoutHandler)
  canvas.addEventListener('mouseout', mouseoutHandler)


  // canvas.addEventListener('mousemove', (e) => {
  //   if (!mouseDown) return;

  //   let mx = e.offsetX;
  //   let my = e.offsetY;

  //   if (oldX === null) {
  //     oldX = mx;
  //   }
  //   if (oldY === null) {
  //     oldY = my;
  //   }

  //   ctx.beginPath();
  //   ctx.moveTo(oldX, oldY);
  //   ctx.lineTo(mx, my);
  //   ctx.closePath();
  //   ctx.stroke();

  //   oldX = mx;
  //   oldY = my;
  // })
})

