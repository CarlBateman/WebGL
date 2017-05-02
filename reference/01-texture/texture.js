/// <reference path="geometry.js" />

"use strict";

window.addEventListener('DOMContentLoaded', function () { main(); });

function main() {
  const vertexBufferInfo = {
    id: null,
    itemSize: 2,
    numItems: 0,
  };

  var textureBufferInfo = {
    id: null,
    itemSize: 2,
    numItems: 0,
  };

  var indexBufferInfo = {
    id: null,
    itemSize: 2,
    numItems: 0,
  };

  const programInfo = {
    id: null,
    aVertex: null,
    aTextureCoord: null,
    uSampler: null,
    uResolution: null,
  };

  (function init() {
    const canvas = document.getElementById("glcanvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const gl = WebGLUtils.setupWebGL(canvas);

    if (gl) {
      loadShaderProgram(gl, "vert.glsl", "frag.glsl", function (programInfoId) {
        if (!programInfoId) return;

        programInfo.id = programInfoId;

        initVariableLocations(gl);
        initGeometry(gl);

        initTexture(gl);

        var scale = [1, 1];
        var ratio = gl.canvas.width / gl.canvas.height;
        if (ratio < 0)
          scale[1] = ratio;
        else
          scale[0] = 1 / ratio;

        gl.uniform2fv(gl.getUniformLocation(programInfo.id, "uScale"), scale);

      });
    }
  })();

  function initVariableLocations(gl) {
    programInfo.uSampler = gl.getUniformLocation(programInfo.id, "uSampler");
    programInfo.uResolution = gl.getUniformLocation(programInfo.id, "uResolution");

    programInfo.aVertex = gl.getAttribLocation(programInfo.id, "aVertex");
    programInfo.aTextureCoord = gl.getAttribLocation(programInfo.id, "aTextureCoord");
  }

  function initGeometry(gl) {
    initBuffer(gl, geometry.vertices, programInfo.aVertex, vertexBufferInfo);
    initBuffer(gl, geometry.textureCoords, programInfo.aTextureCoord, textureBufferInfo);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(programInfo.uSampler, 0);
  }

  function initBuffer(gl, data, attrib, buffer) {
    var array = new Float32Array(data);
    buffer.numItems = array.length / buffer.itemSize;

    buffer.id = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.id);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    gl.vertexAttribPointer(attrib, buffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrib);
  }


  function initTexture(gl) {
    var texture = gl.createTexture();
    var image = new Image();
    image.onload = function () { handleTextureLoaded(gl, image, texture); }
    image.src = "../../assets/imgs/dm.png";
  }

  function handleTextureLoaded(gl, image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    draw(gl);
  }

  function draw(gl) {
    (function redraw() {
      gl.clearColor(0, 0.5, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexBufferInfo.numItems);

      requestAnimationFrame(redraw);
    })();
  }
}