/// <reference path="geometry.js" />

"use strict";

window.addEventListener('DOMContentLoaded', function () { main(); });

function main() {
  const bufferInfo = {
    vertices: {
      id: null,
      itemSize: 2,
      numItems: 0,
    },

    textureCoords: {
      id: null,
      itemSize: 2,
      numItems: 0,
    }
  };

  const programInfo = {
    id: null,
    attributes: {
      aVertex: null,
      aTextureCoord: null,
    },
    uniforms: {
      uSampler: null,
      uScale: null,
      uOffset: null,
    },
    textures: [],
    images:[]
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

        initVariableLocations(gl, programInfo);
        initGeometry(gl);

        initTexture(gl, programInfo, "../../assets/imgs/dm.png");
        initTexture(gl, programInfo, "../../assets/imgs/cat.png");

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

  function initVariableLocations(gl, programInfo) {
    initUniformLocations(gl, programInfo.id, programInfo.uniforms);
    initAttributeLocations(gl, programInfo.id, programInfo.attributes);
  }

  function initUniformLocations(gl, programId, uniforms) {
    for (let property in uniforms) {
      if (uniforms.hasOwnProperty(property)) {
        uniforms[property] = gl.getUniformLocation(programId, property);
        gl.g
      }
    }
  }

  function initAttributeLocations(gl, programId, attributes) {
    for (let property in attributes) {
      if (attributes.hasOwnProperty(property)) {
        attributes[property] = gl.getAttribLocation(programId, property);
      }
    }
  }


  function initGeometry(gl) {
    initBuffer(gl, geometry.vertices, programInfo.attributes.aVertex, bufferInfo.vertices);
    initBuffer(gl, geometry.textureCoords, programInfo.attributes.aTextureCoord, bufferInfo.textureCoords);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(programInfo.uniforms.uSampler, 0);
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


  function initTexture(gl, programInfo, src) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var initialColor = new Uint8Array([0, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, initialColor);

    var image = new Image();
    image.onload = function () { handleTextureLoaded(gl, image, texture); }
    image.src = src;
    programInfo.textures.push(texture);
    programInfo.images.push(image);
  }

  function handleTextureLoaded(gl, image, texture){ 
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


      for (var i = 0; i < programInfo.textures.length; i++) {
        gl.uniform1f(programInfo.uniforms.uOffset, -.25+i/2);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, programInfo.images[i]);
        gl.bindTexture(gl.TEXTURE_2D, programInfo.textures[i]);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, bufferInfo.vertices.numItems);
      }

      requestAnimationFrame(redraw);
    })();
  }
}