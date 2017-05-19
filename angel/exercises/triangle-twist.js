var gl;
var points;
var points = [];
var numTimesToSubdivide = 0;
var angularScale = 0;
var isFractal = false;
var shape = "Square2";

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Load the data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * Math.pow(3, 6), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();

  document.getElementById("slider").oninput = function (event) {
    numTimesToSubdivide = Number(eventtarget(event).value);
    render();
  };

  document.getElementById("angle").oninput = function (event) {
    angularScale = -Number(eventtarget(event).value) * Math.PI / 180;
    render();
  };

  document.getElementById("fractal").onchange = function (event) {
    isFractal = Boolean(eventtarget(event).checked);
    render();
  };

  document.getElementById("shapes").onchange = function (event) {
    shape = eventtarget(event).value;

    var slider = document.getElementById("slider");
    if (shape === "TrueSquare") {
      // limit recursion depth to avoid overflow
      slider.max = 6;
      numTimesToSubdivide = numTimesToSubdivide <= 6 ? numTimesToSubdivide : 6;
      slider.value = numTimesToSubdivide;
    } else {
      slider.max = 10;
      // force slider refresh
      var t = slider.value;
      slider.value = 1;
      slider.value = t;
    }
    document.getElementById("RecursiveSteps").innerHTML = document.getElementById("slider").max;
    render();
  };
};

function eventtarget(event) {
  var targ;
  if (event.target) targ = event.target;
  else if (event.srcElement) targ = event.srcElement;
  if (targ.nodeType == 3) // defeat Safari bug 
    targ = targ.parentNode;

  return targ;
}

function setupTriangle() {
  // let's make it a true equilateral triangle
  var angle = Math.PI / 6;
  var x1 = Math.cos(angle), y1 = Math.sin(angle);
  var vertices = [x1, -y1, 0, y1 * 2, -x1, -y1];

  var a = vertices.slice(0, 2);
  var b = vertices.slice(2, 4);
  var c = vertices.slice(4, 6);

  subdivideTri(a, b, c, numTimesToSubdivide, points);
}

function setupPentagon() {
  var vertices = [0, 0, 0, -1, -0.95, -0.31, -0.59, 0.81, 0.59, 0.81, 0.95, -0.31];

  var o = vertices.slice(0, 2);
  var a = vertices.slice(2, 4);
  var b = vertices.slice(4, 6);
  var c = vertices.slice(6, 8);
  var d = vertices.slice(8, 10);
  var e = vertices.slice(10, 12);

  subdivideTri(o, a, b, numTimesToSubdivide, points);
  subdivideTri(o, b, c, numTimesToSubdivide, points);
  subdivideTri(o, c, d, numTimesToSubdivide, points);
  subdivideTri(o, d, e, numTimesToSubdivide, points);
  subdivideTri(o, e, a, numTimesToSubdivide, points);
}

function setupSquare() {
  var vertices = [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5];

  var a = vertices.slice(0, 2);
  var b = vertices.slice(2, 4);
  var c = vertices.slice(4, 6);
  var d = vertices.slice(6, 8);

  subdivideTri(a, b, c, numTimesToSubdivide, points);
  subdivideTri(a, d, c, numTimesToSubdivide, points);
}

function setupTrueSquare() {
  var vertices = [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5];

  var a = vertices.slice(0, 2);
  var b = vertices.slice(2, 4);
  var c = vertices.slice(4, 6);
  var d = vertices.slice(6, 8);

  subdivideSqr(a, b, c, d, numTimesToSubdivide, points);
}

function setupStar() {
  // let's make it a true equilateral triangle
  var angle = Math.PI / 6;
  var x1 = Math.cos(angle), y1 = Math.sin(angle);
  var vertices = [x1, -y1, 0, y1 * 2, -x1, -y1, -x1, y1, 0, -y1 * 2, x1, y1];

  var a = vertices.slice(0, 2);
  var b = vertices.slice(2, 4);
  var c = vertices.slice(4, 6);

  var d = vertices.slice(6, 8);
  var e = vertices.slice(8, 10);
  var f = vertices.slice(10, 12);

  subdivideTri(a, b, c, numTimesToSubdivide, points);
  subdivideTri(d, e, f, numTimesToSubdivide, points);
}

function render() {
  points = [];

  switch (shape) {
    case "Star":
      setupStar();
      break;
    case "Square":
      setupSquare();
      break;
    case "Pentagon":
      setupPentagon();
      break;
    case "TrueSquare":
      setupTrueSquare();
      break;
    default:
      setupTriangle();
      break;
  }
  
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

function twist(a) {
  var l = length(a) * angularScale;
  var x1 = a[0] * Math.cos(l) - a[1] * Math.sin(l);
  var y1 = a[0] * Math.sin(l) + a[1] * Math.cos(l);
  return [x1, y1];
}

function makeTriangle(a, b, c, points) {
  points.push(twist(a), twist(b), twist(c));
}

function subdivideTri(a, b, c, n, points) {
  if (n === 0) {
    makeTriangle(a, b, c, points);
    return;
  }

  var ab = mix(a, b, 0.5);
  var bc = mix(b, c, 0.5);
  var ac = mix(a, c, 0.5);
  n--;

  if(!isFractal)
    subdivideTri(ab, ac, bc, n, points);
  subdivideTri(a, ab, ac, n, points);
  subdivideTri(ab, b, bc, n, points);
  subdivideTri(ac, bc, c, n, points);
}

function makeSquare(a, b, c, d, points) {
  points.push(twist(a), twist(b), twist(c));
  points.push(twist(a), twist(c), twist(d));
}

function subdivideSqrStep2(a, b, c, d, n) {
  var a1 = mix(a, b, 0.66);
  var a2 = mix(a, c, 0.66);
  var a3 = mix(a, d, 0.66);

  subdivideSqr(a, a1, a2, a3, n, points);

  return [a, a1, a2, a3];
}

function subdivideSqr(a, b, c, d, n, points) {
  if (n === 0) {
    makeSquare(a, b, c, d, points);
    return;
  }

  n--;

  var a1 = mix(a, b, 0.66);
  var a2 = mix(a, c, 0.66);
  var a3 = mix(a, d, 0.66);

  var b1 = mix(b, c, 0.66);
  var b2 = mix(b, d, 0.66);
  var b3 = mix(b, a, 0.66);

  var c1 = mix(c, d, 0.66);
  var c2 = mix(c, a, 0.66);
  var c3 = mix(c, b, 0.66);

  var d1 = mix(d, a, 0.66);
  var d2 = mix(d, b, 0.66);
  var d3 = mix(d, c, 0.66);

  if (!isFractal)
    subdivideSqr(a2, b2, c2, d2, n, points);

  subdivideSqr(a, a1, a2, a3, n, points);
  subdivideSqr(b, b1, b2, b3, n, points);
  subdivideSqr(c, c1, c2, c3, n, points);
  subdivideSqr(d, d1, d2, d3, n, points);

  subdivideSqr(a1, b3, b2, a2, n, points);
  subdivideSqr(b1, c3, c2, b2, n, points);
  subdivideSqr(c1, d3, d2, c2, n, points);
  subdivideSqr(d1, a3, a2, d2, n, points);
}