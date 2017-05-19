var gl;
var points = [];
var r = [];
var numTimesToSubdivide = 0;
var angularScale = 0;
var vColour;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];

var models = [];
var selection = -1;

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");
  canvas.height = window.innerHeight * .75;
  canvas.width = canvas.height;

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Load the data into the GPU
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  //gl.bufferData(gl.ARRAY_BUFFER, 8 * Math.pow(3, 6), gl.STATIC_DRAW);

  // Associate our shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);


  vColour = gl.getUniformLocation(program, "vColour");

  //setupTetra(points, 3);
  //for (var i = 0; i < points.length; i++) {
  //  points[i] = normalize(points[i]);
  //}
  //points = flatten(points);
  //points = makeSphere00().vertexPositions;
  //points = makeCube2().vertexPositions;
  var model = makeModel();
  model.points = makeCylinder().vertexPositions;
  model.position = [0, 0, -6];
  model.type = "cylinder";
  models.push(model);

  model = makeModel();
  model.points = makeSphere().vertexPositions;
  model.position = [1, 0, -6];
  model.type = "sphere";
  models.push(model);

  render();

  document.getElementById("Update").onclick = updateSelected;
  //document.getElementById("ButtonY").onclick = function () { axis = yAxis; render(); };
  //document.getElementById("ButtonZ").onclick = function () { axis = zAxis; render(); };

  var sel = document.getElementById("modelList");
  var el = document.createElement("option");
  el.textContent = "none";
  el.value = -1;
  sel.appendChild(el);
  for (var i = 0; i < models.length; i++) {
    var opt = models[i];
    var el = document.createElement("option");
    el.textContent = opt.type + "(" + i + ")";
    el.value = i;
    sel.appendChild(el);
  }

  sel.onchange = selchange;
};

function updateSelected() {
  selection = Number(document.getElementById("modelList").value);
  if (selection === -1) {
    return;
  } else {
    var txtPosX = document.getElementById("posx");
    var txtPosY = document.getElementById("posy");
    var txtPosZ = document.getElementById("posz");
    var txtRotX = document.getElementById("rotx");
    var txtRotY = document.getElementById("roty");
    var txtRotZ = document.getElementById("rotz");
    models[selection].position[0] = txtPosX.value;
    models[selection].position[1] = txtPosY.value;
    models[selection].position[2] = txtPosZ.value;
    models[selection].rotation[0] = txtRotX.value;
    models[selection].rotation[1] = txtRotY.value;
    models[selection].rotation[2] = txtRotZ.value;
  }
  render();
}

function  selchange(){
  selection = Number(document.getElementById("modelList").value);
  var txtPosX = document.getElementById("posx");
  var txtPosY = document.getElementById("posy");
  var txtPosZ = document.getElementById("posz");
  var txtRotX = document.getElementById("rotx");
  var txtRotY = document.getElementById("roty");
  var txtRotZ = document.getElementById("rotz");
  if (selection === -1) {
    txtPosX.value = "";
    txtPosY.value = "";
    txtPosZ.value = "";
    txtRotX.value = "";
    txtRotY.value = "";
    txtRotZ.value = "";
  } else {
    txtPosX.value = models[selection].position[0];
    txtPosY.value = models[selection].position[1];
    txtPosZ.value = models[selection].position[2];
    txtRotX.value = models[selection].rotation[0];
    txtRotY.value = models[selection].rotation[1];
    txtRotZ.value = models[selection].rotation[2];
  }
  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  for (var m = 0; m < models.length; m++) {
    var model = models[m];
    modelView = mat4();
    modelView = mult(modelView, translate(model.position[0], model.position[1], model.position[2]));
    modelView = mult(modelView, rotate(model.rotation[0], [1, 0, 0]));
    modelView = mult(modelView, rotate(model.rotation[1], [0, 1, 0]));
    modelView = mult(modelView, rotate(model.rotation[2], [0, 0, 1]));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "matModelView"), false, flatten(modelView));

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.points), gl.STATIC_DRAW);
    gl.uniform4fv(vColour, [1, 0, 1, 1]);
    gl.drawArrays(gl.TRIANGLES, 0, model.points.length / 3);

    gl.uniform4fv(vColour, [0, 0, 1, 1]);
    for (var i = 0; i < model.points.length / 3 - 3; i += 3) {
      gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
  }

  if (selection > -1) {
    renderSelected(models[selection]);
  }

  //requestAnimFrame(render);

}

function renderSelected(model) {
  modelView = mat4();
  modelView = mult(modelView, translate(model.position[0], model.position[1], model.position[2]));
  modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0]));
  modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0]));
  modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1]));
  modelView = mult(modelView, scalem(1.1, 1.1, 1.1));

  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "matModelView"), false, flatten(modelView));
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.points), gl.STATIC_DRAW);
  gl.uniform4fv(vColour, [0, 1, 1, 1]);
  gl.drawArrays(gl.TRIANGLES, 0, model.points.length / 3);
  gl.cullFace(gl.BACK);
  gl.disable(gl.CULL_FACE);

  gl.enable(gl.BLEND);
  gl.uniform4fv(vColour, [0, 1, 1, 0.4]);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.drawArrays(gl.TRIANGLES, 0, model.points.length / 3);
  gl.disable(gl.BLEND);
}