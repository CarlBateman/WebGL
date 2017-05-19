var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

var gl;
var points = [];
var r = [];
var numTimesToSubdivide = 0;
var angularScale = 0;
var vColour;
var program;
var backColour = [1,1,1,1];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];

var models = [];
var selection = -1;
var modelId = 0;

var txtSceneRotX = 0;
var txtSceneRotY = 0;
var txtSceneRotZ = 0;


var ObjectOptions = function () {
  this.Name = "";
  this.Type = "";
  this.p = { X: 0, Y: 0, Z: 0 };
  this.r = { X: 0, Y: 0, Z: 0 };
  this.colour = [1, 1, 1, 1];
  this.lineColour = [1, 1, 1, 1];
  this.Add = function () { };
  this.Delete = function () { };
};

function initModelSelectList() {
  var oldsel = document.getElementById("modelList");
  // remove any existing options
  var sel = oldsel.cloneNode(false);
  oldsel.parentNode.replaceChild(sel, oldsel);

  var el = document.createElement("option");
  el.textContent = "none";
  el.value = -1;
  sel.appendChild(el);
  sel.selectedIndex = 0;
  selection = -1;
  modelId = 0;
}

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

  initModelSelectList()

  document.getElementById("Refresh").onclick = render;

  var colourTip = document.getElementById("ColourTip");
  var backColourTip = document.getElementById("BackColourTip");
  if (isIE) {
    colourTip.innerHTML = "Sorry, colour picker not supported in IE.<br />Please use #rrggbb."
    backColourTip.innerHTML = "Sorry, colour picker not supported in IE.<br />Please use #rrggbb."
  }
  if (isSafari) {
    colourTip.innerHTML = "Sorry, colour picker not supported in Safari.<br />Please use #rrggbb."
    backColourTip.innerHTML = "Sorry, colour picker not supported in Safari.<br />Please use #rrggbb."
  }
  if (!isSafari && !isIE) {
    var colourTipParent = document.getElementById("ColourTipParent");
    colourTipParent.removeChild(colourTip);
    colourTipParent = document.getElementById("BackColourTipParent");
    colourTipParent.removeChild(backColourTip);
  }

  if (isIE) {
    document.getElementById("srotx").onchange = updateScene;
    document.getElementById("sroty").onchange = updateScene;
    document.getElementById("srotz").onchange = updateScene;
    document.getElementById("rotx").onchange = updateSelected;
    document.getElementById("roty").onchange = updateSelected;
    document.getElementById("rotz").onchange = updateSelected;
  }  else {
    document.getElementById("srotx").oninput = updateScene;
    document.getElementById("sroty").oninput = updateScene;
    document.getElementById("srotz").oninput = updateScene;
    document.getElementById("rotx").oninput = updateSelected;
    document.getElementById("roty").oninput = updateSelected;
    document.getElementById("rotz").oninput = updateSelected;
  }

  document.getElementById("showLines").onchange = updateSelected;
  document.getElementById("posx").onchange = updateSelected;
  document.getElementById("posy").onchange = updateSelected;
  document.getElementById("posz").onchange = updateSelected;
  document.getElementById("scalex").onchange = updateSelected;
  document.getElementById("scaley").onchange = updateSelected;
  document.getElementById("scalez").onchange = updateSelected;
  document.getElementById("addCylinder").onclick = function () { addCylinder(); };
  document.getElementById("addSphere").onclick = function () { addSphere(); };
  document.getElementById("addCone").onclick = function () { addCone(); };
  document.getElementById("Delete").onclick = function () { deleteModel(); render(); };
  document.getElementById("ClearAll").onclick = function () { models = []; initModelSelectList(); selchange(); render(); };
  document.getElementById("modelList").onchange = selchange;
  document.getElementById("colour").onchange = updateSelected;
  document.getElementById("backColour").onchange = function () {
    var c = hexToRgb(document.getElementById("backColour").value);
    backColour[0] = c.r / 255;
    backColour[1] = c.g / 255;
    backColour[2] = c.b / 255;
    render();
  };

  document.getElementById("resetSceneRot").onclick = function () {
    document.getElementById("srotx").value = 0; document.getElementById("sroty").value = 0; document.getElementById("srotz").value = 0;
    txtSceneRotX = 0; txtSceneRotY = 0; txtSceneRotZ = 0; render();
  };
  document.getElementById("resetRot").onclick = function () {
    document.getElementById("rotx").value = 0; document.getElementById("roty").value = 0; document.getElementById("rotz").value = 0;
    updateSelected();
  };

  //addCylinder();
  //addCone();
  //addSphere();
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function arrayToHex(a) {
  return "#" + ((1 << 24) + ((255*a[0]) << 16) + ((255*a[1]) << 8) + (255*a[2])).toString(16).slice(1);
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function removeOptions(selectbox) {
  var i;
  for (i = selectbox.options.length - 1; i >= 0; i--) {
    selectbox.remove(i);
  }
}

function deleteModel() {
  var sel = document.getElementById("modelList");
  var modelName = sel.options[sel.selectedIndex].text;
  var i;
  for (i = sel.options.length - 1; i >= 0; i--) {
    if (modelName == sel.options[i].text) {
      sel.remove(i);
      models.splice(i - 1, 1);
      selchange();
      break;
    }
  }
}

function addModelToList(model) {
  var list = document.getElementById("modelList");
  var el = document.createElement("option");
  var i = list.options.length-1;
  el.textContent = model.type + "(" + (modelId++) + ")";
  el.value = i;
  list.appendChild(el);
  list.selectedIndex = i+1;

  return el.textContent;
}

function addCone() {
  var model = makeModel();
  model.points = makeCone().vertexPositions;
  model.position = [0, 1, 0];
  model.type = "cone";
  model.name = addModelToList(model);
  model.colour = [0,0,1, 1];
  model.lineColour = [1,1,0, 1];
  models.push(model);
  selchange();
  render();
}

function addCylinder() {
  var model = makeModel();
  model.points = makeCylinder().vertexPositions;
  model.position = [-2, 0, 0];
  model.type = "cylinder";
  model.name = addModelToList(model);
  model.colour = [1, 0, 0, 1];
  model.lineColour = [0, 1, 1, 1];
  models.push(model);
  selchange();
  render();
}

function addSphere() {
  var model = makeModel();
  model.points = makeSphere().vertexPositions;
  model.position = [2, 0, 0];
  model.type = "sphere";
  model.name = addModelToList(model);
  model.colour = [0, 1, 0, 1];
  model.lineColour = [1, 0, 1, 1];
  models.push(model);
  selchange();
  render();
}

function updateScene(event) {
  txtSceneRotX = Number(document.getElementById("srotx").value);
  txtSceneRotY = Number(document.getElementById("sroty").value);
  txtSceneRotZ = Number(document.getElementById("srotz").value);
  requestAnimFrame(render);
}

function updateSelected(event) {
  selection = Number(document.getElementById("modelList").selectedIndex) - 1;
  if (selection === -1) {
    return;
  } else {
    var txtColour = document.getElementById("colour");
    var txtShowLines = document.getElementById("showLines");
    var txtPosX = document.getElementById("posx");
    var txtPosY = document.getElementById("posy");
    var txtPosZ = document.getElementById("posz");
    var txtRotX = document.getElementById("rotx");
    var txtRotY = document.getElementById("roty");
    var txtRotZ = document.getElementById("rotz");
    var txtScaleX = document.getElementById("scalex");
    var txtScaleY = document.getElementById("scaley");
    var txtScaleZ = document.getElementById("scalez");

    var c = hexToRgb(txtColour.value);
    models[selection].colour[0] = c.r / 255;
    models[selection].colour[1] = c.g / 255;
    models[selection].colour[2] = c.b / 255;

    models[selection].showLines = txtShowLines.checked;
    models[selection].position[0] = txtPosX.value;
    models[selection].position[1] = txtPosY.value;
    models[selection].position[2] = txtPosZ.value;
    models[selection].rotation[0] = txtRotX.value;
    models[selection].rotation[1] = txtRotY.value;
    models[selection].rotation[2] = txtRotZ.value;
    models[selection].scale[0] = txtScaleX.value;
    models[selection].scale[1] = txtScaleY.value;
    models[selection].scale[2] = txtScaleZ.value;
  }
  requestAnimFrame(render);
}

function selchange() {
  selection = Number(document.getElementById("modelList").selectedIndex)-1;
  var txtColour = document.getElementById("colour");
  var txtShowLines = document.getElementById("showLines");
  var txtPosX = document.getElementById("posx");
  var txtPosY = document.getElementById("posy");
  var txtPosZ = document.getElementById("posz");
  var txtRotX = document.getElementById("rotx");
  var txtRotY = document.getElementById("roty");
  var txtRotZ = document.getElementById("rotz");
  var txtScaleX = document.getElementById("scalex");
  var txtScaleY = document.getElementById("scaley");
  var txtScaleZ = document.getElementById("scalez");
  if (selection === -1) {
    txtColour.value = "#ffffff";
    txtShowLines.checked = false;
    txtPosX.value = "";
    txtPosY.value = "";
    txtPosZ.value = "";
    txtRotX.value = "";
    txtRotY.value = "";
    txtRotZ.value = "";
    txtScaleX.value = "";
    txtScaleY.value = "";
    txtScaleZ.value = "";
    txtScaleZ.value = "";
  } else {
    txtColour.value = arrayToHex(models[selection].colour);
    txtPosX.value = models[selection].position[0];
    txtPosY.value = models[selection].position[1];
    txtPosZ.value = models[selection].position[2];
    txtRotX.value = models[selection].rotation[0];
    txtRotY.value = models[selection].rotation[1];
    txtRotZ.value = models[selection].rotation[2];
    txtScaleX.value = models[selection].scale[0];
    txtScaleY.value = models[selection].scale[1];
    txtScaleZ.value = models[selection].scale[2];
    txtShowLines.checked = models[selection].showLines;
  }
  requestAnimFrame(render);
}

function render() {
  gl.clearColor(backColour[0], backColour[1], backColour[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  if (models.length > 0) {
    var model = models[0];
    var sceneView = mat4();
    sceneView = mult(sceneView, translate(0,0,-13));
    sceneView = mult(sceneView, rotate(txtSceneRotX, [1, 0, 0]));
    sceneView = mult(sceneView, rotate(txtSceneRotY, [0, 1, 0]));
    sceneView = mult(sceneView, rotate(txtSceneRotZ, [0, 0, 1]));
  }
  for (var m = 0; m < models.length; m++) {
    var model = models[m];
    var modelView = mat4();
    modelView = mult(modelView, sceneView);
    modelView = mult(modelView, translate(model.position[0], model.position[1], model.position[2]));
    modelView = mult(modelView, rotate(model.rotation[0], [1, 0, 0]));
    modelView = mult(modelView, rotate(model.rotation[1], [0, 1, 0]));
    modelView = mult(modelView, rotate(model.rotation[2], [0, 0, 1]));
    modelView = mult(modelView, scalem(model.scale[0], model.scale[1], model.scale[2]));

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "matModelView"), false, flatten(modelView));

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.points), gl.STATIC_DRAW);
    gl.uniform4fv(vColour, model.colour);
    gl.drawArrays(gl.TRIANGLES, 0, model.points.length / 3);

    if (model.showLines) {
      gl.uniform4fv(vColour, model.lineColour);
      for (var i = 0; i < model.points.length / 3 - 3; i += 3) {
        gl.drawArrays(gl.LINE_LOOP, i, 3);
      }
    }
  }

  if (selection > -1) {
    renderSelected(models[selection]);
  }

  //requestAnimFrame(render);
}

function renderSelected(model) {
  var sceneView = mat4();
  sceneView = mult(sceneView, translate(0, 0, -13));
  sceneView = mult(sceneView, rotate(txtSceneRotX, [1, 0, 0]));
  sceneView = mult(sceneView, rotate(txtSceneRotY, [0, 1, 0]));
  sceneView = mult(sceneView, rotate(txtSceneRotZ, [0, 0, 1]));

  modelView = mat4();
    modelView = mult(modelView, sceneView);
  modelView = mult(modelView, translate(model.position[0], model.position[1], model.position[2]));
  modelView = mult(modelView, rotate(model.rotation[0], [1, 0, 0]));
  modelView = mult(modelView, rotate(model.rotation[1], [0, 1, 0]));
  modelView = mult(modelView, rotate(model.rotation[2], [0, 0, 1]));
  modelView = mult(modelView, scalem(model.scale[0] * 1.1, model.scale[1] * 1.1, model.scale[2] * 1.1));

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