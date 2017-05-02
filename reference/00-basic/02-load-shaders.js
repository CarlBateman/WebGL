"use strict";

window.addEventListener('DOMContentLoaded', function () { main(); });

function main() {
  var gl;

  var bufferInfo = {
    id: null,
    itemSize: 0,
    numItems: 0,
  };

  var programInfo = {
    id: null,
    aVertex: null,
  };

  (function init() {
    var canvas = document.getElementById("glcanvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl = WebGLUtils.setupWebGL(canvas);

    if (gl) {
      loadShaderProgram(gl, "vert.glsl", "frag.glsl", function (programInfoId) {
        if (!programInfoId) return;

        programInfo.id = programInfoId;

        initVariableLocations();
        initGeometry();

        draw();
      });
    }
  })();

  function initVariableLocations() {
    programInfo.aVertex = gl.getAttribLocation(programInfo.id, "aVertex");
  }

  function initGeometry() {
    var vertices = new Float32Array([
      -0.5, 0.5,
       0.5, -0.5,
      -0.5, -0.5]);
    bufferInfo.itemSize = 2;
    bufferInfo.numItems = vertices.length / bufferInfo.itemSize;

    bufferInfo.id = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.id);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(programInfo.aVertex, bufferInfo.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.aVertex);
  }

  function draw() {
    gl.clearColor(0, 0.5, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numItems);

    requestAnimationFrame(draw);
  }
}