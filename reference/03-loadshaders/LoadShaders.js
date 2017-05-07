window.addEventListener('DOMContentLoaded', function () { main(); });

function main() {
  var gl;

  var bufferInfo = {
    id: null,
    itemSize: 2,
    numItems: 0,
  };

  var programInfo = {
    id: null,
    aVertex: null,
    uColour: null,
  };

  (function init() {
    var canvas = document.getElementById("glcanvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) return;

    //programInfo.id = initShaderProgram(gl, "vert.glsl", "frag.glsl");


    programInfo.id = initShaderProgram(gl, "shader-vs", "shader-fs");
    if (!programInfo.id) return;

    initVariableLocations();
    initGeometry();

    var scale = [1, 1];
    var ratio = gl.canvas.width / gl.canvas.height;
    if (ratio < 0)
      scale[1] = ratio;
    else
      scale[0] = 1 / ratio;

    gl.uniform2fv(gl.getUniformLocation(programInfo.id, "uScale"), scale);

    draw();
  })();

  function initVariableLocations() {
    programInfo.uColour = gl.getUniformLocation(programInfo.id, "uColour");

    programInfo.aVertex = gl.getAttribLocation(programInfo.id, "aVertex");
  }

  function initGeometry() {
    var vertices = new Float32Array([-1, 1,
                                      1, -1,
                                     -1, -1,
                                     -1, 1,
                                      1, -1,
                                      1, 1]);
    bufferInfo.numItems = vertices.length / bufferInfo.itemSize;

    bufferInfo.id = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.id);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(programInfo.aVertex, bufferInfo.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.aVertex);
  }

  function draw() {
    gl.uniform4fv(programInfo.uColour, [0.0, 1.0, 0.0, 1.0]);

    gl.clearColor(0, 0.5, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numItems);
  }
}
