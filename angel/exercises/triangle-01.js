var gl;
var points;
var r = [];
var numTimesToSubdivide = 0;

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  // let's make it a true equilateral triangle
  var angle = Math.PI / 6;
  var x1 = Math.cos(angle), y1 = Math.sin(angle);
  var vertices = [x1, -y1, 0, y1 * 2, -x1, -y1];

  var a = vertices.slice(0, 2);
  var b = vertices.slice(2, 4);
  var c = vertices.slice(4, 6);

  subdivide(a, b, c, numTimesToSubdivide, r);

  //  Configure WebGL

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Load the data into the GPU

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(r), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();

  document.getElementById("slider").onchange = function () {
    numTimesToSubdivide = event.srcElement.value;
    console.log(numTimesToSubdivide);
    render();
  };

};


function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, r.length);
}

function subdivide(a, b, c, n, r) {
  //var r = [];
  if (n === 0) {
    r.push(a, b, c);
    return;
  }

  var ab = mix(a, b, 0.5);
  var bc = mix(b, c, 0.5);
  var ac = mix(a, c, 0.5);
  n--;

  //subdivide(ab, ac, bc, n, r);
  subdivide(a, ab, ac, n, r);
  subdivide(ab, b, bc, n, r);
  subdivide(ac, bc, c, n, r);
}