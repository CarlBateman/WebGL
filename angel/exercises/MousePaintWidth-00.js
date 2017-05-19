"use strict";

var canvas;
var gl;

var maxNumVertices = 2000;
var index = 0;

var cindex = 0;
var thickness = 1;

var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];
var t;
var numPolygons = 0;
var numIndices = [];
numIndices[0] = 0;
var start = [0];
var draw = false;
var prevPt;
var prevPt1;
var prevPt2;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  var m1 = document.getElementById("colourmenu");
  m1.addEventListener("click", function () {
    cindex = m1.selectedIndex;
  });

  var m2 = document.getElementById("thicknessmenu");
  m2.addEventListener("click", function () {
    thickness = Number(m2.value);
  });

  canvas.addEventListener("mouseup", function () {
    draw = false;
    numPolygons++;
    numIndices[numPolygons] = 0;
    start[numPolygons] = index;
    render();
  });

  canvas.addEventListener("mousedown", function (event) {
    //numPolygons++;
    //numIndices[numPolygons] = 0;
    //start[numPolygons] = index;
    draw = true;
    prevPt = vec2(2 * event.clientX / canvas.width - 1, 2 * (canvas.height - event.clientY) / canvas.height - 1);
  });

  canvas.addEventListener("mousemove", function (event) {
    if (!draw) return;
    t = vec2(2 * event.clientX / canvas.width - 1, 2 * (canvas.height - event.clientY) / canvas.height - 1);

    var vAB = normalize(subtract(prevPt, t));
    var p = vec2(thickness * vAB[1] / 512, -thickness * vAB[0] / 512);
    //var p3 = vec2(vAB[1], vAB[0]);
    //var p4 = vec2(Math.cos(Math.PI / 2) * vAB[0] / 5.12, Math.sin(Math.PI / 2) * vAB[1] / 5.12);
    //var p1 = add(p, prevPt);
    //var p2 = subtract(prevPt, p);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(add(prevPt, p)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index + 8, flatten(subtract(prevPt, p)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index + 16, flatten(add(t, p)));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index + 24, flatten(subtract(t, p)));
    prevPt = t;

    t = vec4(colors[cindex]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index + 16, flatten(t));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index + 32, flatten(t));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index + 48, flatten(t));

    numIndices[numPolygons]+=4;
    index+=4;

    render();
  });


  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  //gl.enable(0x0B10);
  //gl.enable(gl.POINT_SMOOTH);

  //console.log(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE));
  //console.log(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE));

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);
  var vPos = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPos);

  var cBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBufferId);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);
  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.lineWidth(10.0);

  for (var i = 0; i < numPolygons+1; i++) {
    //gl.drawArrays(gl.LINE_STRIP, start[i], numIndices[i]);
    gl.drawArrays(gl.TRIANGLE_STRIP, start[i], numIndices[i]);
    //gl.drawArrays(gl.POINTS, start[i], numIndices[i]);
  }
}