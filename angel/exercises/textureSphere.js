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
var backColour = [0.9, 0.9, 0.9, 1];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];

var models = [];
var lights = [];
var selection = -1;
var modelId = 0;

var txtSceneRotX = 0;
var txtSceneRotY = 0;
var txtSceneRotZ = 0;

var vertexBufferId, normalBufferId, textureBufferId;

var aTextureCoord, uSampler, texCheck;


//function initModelSelectList() {
//  var oldsel = document.getElementById("modelList");
//  // remove any existing options
//  var sel = oldsel.cloneNode(false);
//  oldsel.parentNode.replaceChild(sel, oldsel);

//  var el = document.createElement("option");
//  el.textContent = "none";
//  el.value = -1;
//  sel.appendChild(el);
//  sel.selectedIndex = 0;
//  selection = -1;
//  modelId = 0;
//}

window.onload = function init() {
  var canvas = document.getElementById("gl-canvas");
  canvas.height = window.innerHeight * .75;
  canvas.width = canvas.height;

  var h2 = document.getElementById("h2");
  h2.width = canvas.width;

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }
  //console.log(gl.getParameter(gl.MAX_VARYING_VECTORS));

  //  Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Load the data into the GPU
  vertexBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferId);

  // Associate our shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  normalBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferId);

  // Associate our shader variables with our data buffer
  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);



  textureBufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBufferId);

  var aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
  gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aTextureCoord);

  uSampler = gl.getUniformLocation(program, "uSampler");

  vColour = gl.getUniformLocation(program, "vColour");
  //initModelSelectList()

  //document.getElementById("Refresh").onclick = render;

  var colourTip = document.getElementById("ColourTip");
  var backColourTip = document.getElementById("BackColourTip");
  var lightColourTip = document.getElementById("LightColourTip");
  if (isIE) {
    colourTip.innerHTML = "Sorry, colour picker not supported in IE.<br />Please use #rrggbb."
    backColourTip.innerHTML = "Sorry, colour picker not supported in IE.<br />Please use #rrggbb."
    lightColourTip.innerHTML = "Sorry, colour picker not supported in IE.<br />Please use #rrggbb."
  }
  if (isSafari) {
    colourTip.innerHTML = "Sorry, colour picker not supported in Safari.<br />Please use #rrggbb."
    backColourTip.innerHTML = "Sorry, colour picker not supported in Safari.<br />Please use #rrggbb."
    lightColourTip.innerHTML = "Sorry, colour picker not supported in Safari.<br />Please use #rrggbb."
  }
  if (!isSafari && !isIE) {
    var colourTipParent = document.getElementById("ColourTipParent");
    colourTipParent.removeChild(colourTip);
    colourTipParent = document.getElementById("BackColourTipParent");
    colourTipParent.removeChild(backColourTip);
    colourTipParent = document.getElementById("LightColourTipParent");
    colourTipParent.removeChild(lightColourTip);
  }

  if (isIE) {
    document.getElementById("srotx").onchange = updateScene;
    document.getElementById("sroty").onchange = updateScene;
    document.getElementById("srotz").onchange = updateScene;
    document.getElementById("rotx").onchange = updateSelectedModel;
    document.getElementById("roty").onchange = updateSelectedModel;
    document.getElementById("rotz").onchange = updateSelectedModel;
  }  else {
    document.getElementById("srotx").oninput = updateScene;
    document.getElementById("sroty").oninput = updateScene;
    document.getElementById("srotz").oninput = updateScene;
    document.getElementById("rotx").oninput = updateSelectedModel;
    document.getElementById("roty").oninput = updateSelectedModel;
    document.getElementById("rotz").oninput = updateSelectedModel;
  }

  document.getElementById("lightList").onchange = updateLightMenu;
  document.getElementById("lightAmbient").onchange = updateSelectedLight;
  document.getElementById("lightSpecular").onchange = updateSelectedLight;
  document.getElementById("lightColour").onchange = updateSelectedLight;
  document.getElementById("active").onchange = updateSelectedLight;
  document.getElementById("animate").onchange = updateSelectedLight;

  document.getElementById("showLines").onchange = updateSelectedModel;
  document.getElementById("posx").onchange = updateSelectedModel;
  document.getElementById("posy").onchange = updateSelectedModel;
  document.getElementById("posz").onchange = updateSelectedModel;
  document.getElementById("scalex").onchange = updateSelectedModel;
  document.getElementById("scaley").onchange = updateSelectedModel;
  document.getElementById("scalez").onchange = updateSelectedModel;
  //document.getElementById("Delete").onclick = function () { deleteModel(); /*render();*/ };
  //document.getElementById("ClearAll").onclick = function () { models = []; initModelSelectList(); updateModelMenu(); /*render();*/ };
  document.getElementById("colour").onchange = updateSelectedModel;
  document.getElementById("backColour").onchange = function () {
    var c = hexToRgb(document.getElementById("backColour").value);
    backColour[0] = c.r / 255;
    backColour[1] = c.g / 255;
    backColour[2] = c.b / 255;
    //render();
  };

  document.getElementById("resetSceneRot").onclick = function () {
    document.getElementById("srotx").value = 0; document.getElementById("sroty").value = 0; document.getElementById("srotz").value = 0;
    txtSceneRotX = 0; txtSceneRotY = 0; txtSceneRotZ = 0; //render();
  };
  document.getElementById("resetRot").onclick = function () {
    document.getElementById("rotx").value = 0; document.getElementById("roty").value = 0; document.getElementById("rotz").value = 0;
    updateSelectedModel();
  };

  addLights();
  updateLightMenu();

  //addCylinder();
  //addCone();
  addSphere();
  initTextureCheck();
  loadTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texCheck);
  gl.uniform1i(uSampler, 0);

  render();
}

function initTextureCheck() {
  var texSize = 512, numChecks = 16;
  var image1 = new Uint8Array(4 * texSize * texSize);
  for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
      var patchx = Math.floor(i / (texSize / numChecks));
      var patchy = Math.floor(j / (texSize / numChecks));
      if (patchx % 2 ^ patchy % 2) {
        c = 255;
      } else {
        c = 0;
      }
      image1[4 * i * texSize + 4 * j] = c;
      image1[4 * i * texSize + 4 * j + 1] = c;
      image1[4 * i * texSize + 4 * j + 2] = c;
      image1[4 * i * texSize + 4 * j + 3] = 255;
    }
  }

  texCheck = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texCheck);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize , 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
}

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function loadTexture() {
  texPluto = gl.createTexture();
  var image = new Image();
  image.onload = function () { handleTextureLoaded(image, texPluto); }
  // from http://naturalearth.springercarto.com/ne3_data/8192/textures/1_earth_8k.jpg
  image.src = "1_earth_8k.jpg";
}

function addLights() {
  var light = makeLight();
  light.radius = 120;
  light.animate = false;
  light.angle = 180;
  light.position = [-100, 100, -50, 0];
  light.angleStep = -25;
  animateLight(light)
  light.angleStep = -.2;
  lights.push(light);

  light = makeLight();
  light.radius = 120;
  light.animate = false;
  animateLight(light)
  light.angleStep = .2;
  light.active = false;
  lights.push(light);
}

function updateLightMenu() {
  var lightSelection = Number(document.getElementById("lightList").selectedIndex);
  var txtColour = document.getElementById("lightColour");
  var txtAmbient = document.getElementById("lightAmbient");
  var txtSpecular = document.getElementById("lightSpecular");
  var txtAnimate = document.getElementById("animate");
  var txtActive = document.getElementById("active");

  txtColour.value = arrayToHex(lights[lightSelection].colour);
  txtSpecular.value = arrayToHex(lights[lightSelection].specular);
  txtAmbient.value = arrayToHex(lights[lightSelection].ambient);

  txtAnimate.checked = lights[lightSelection].animate;
  txtActive.checked = lights[lightSelection].active;
}

function setArrayToRgb(a, c) {
  a[0] = c.r / 255;
  a[1] = c.g / 255;
  a[2] = c.b / 255;
}

function updateSelectedLight() {
  var lightSelection = Number(document.getElementById("lightList").selectedIndex);
  var txtColour = document.getElementById("lightColour");
  var txtAmbient = document.getElementById("lightAmbient");
  var txtSpecular = document.getElementById("lightSpecular");
  var txtAnimate = document.getElementById("animate");
  var txtActive = document.getElementById("active");

  setArrayToRgb(lights[lightSelection].colour, hexToRgb(txtColour.value));
  setArrayToRgb(lights[lightSelection].ambient, hexToRgb(txtAmbient.value));
  setArrayToRgb(lights[lightSelection].specular, hexToRgb(txtSpecular.value));

  lights[lightSelection].animate = txtAnimate.checked;
  lights[lightSelection].active = txtActive.checked;
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
      updateModelMenu();
      break;
    }
  }
}

//function addModelToList(model) {
//  var list = document.getElementById("modelList");
//  var el = document.createElement("option");
//  var i = list.options.length-1;
//  el.textContent = model.type + "(" + (modelId++) + ")";
//  el.value = i;
//  list.appendChild(el);
//  list.selectedIndex = i+1;

//  return el.textContent;
//}

function addCone() {
  var model = makeModel();
  var t = makeCone();
  model.points = t.vertexPositions;
  model.normals = t.vertexNormals;
  model.position = [0, 1, 0];
  model.type = "cone";
  model.name = addModelToList(model);
  model.colour = [0,0,1, 1];
  model.lineColour = [1,1,0, 1];
  models.push(model);
  updateModelMenu();
}

function addCylinder() {
  var model = makeModel();
  var t = makeCylinder();
  model.points = t.vertexPositions;
  model.normals = t.vertexNormals;
  model.position = [-2, 0, 0];
  model.type = "cylinder";
  model.name = addModelToList(model);
  model.colour = [1, 0, 0, 1];
  model.lineColour = [0, 1, 1, 1];
  models.push(model);
  updateModelMenu();
}

function addSphere() {
  var model = makeModel();
  var t = makeSphere();
  model.points = t.vertexPositions;
  model.normals = t.vertexNormals;
  model.texCoords = t.vertexTextureCoords;
  //console.log(model.points.length/3, model.texCoords.spherical.length/2)
  model.position = [0, 0, 0];
  model.type = "sphere";
  //model.name = addModelToList(model);
  model.colour = [1, 1, 1, 1];
  model.ambient = [0.5, 0.5, 0.5, 1];
  model.lineColour = [1, 0, 1, 1];
  models.push(model);
  updateModelMenu();
}

function updateScene(event) {
  txtSceneRotX = Number(document.getElementById("srotx").value);
  txtSceneRotY = Number(document.getElementById("sroty").value);
  txtSceneRotZ = Number(document.getElementById("srotz").value);
}

function updateSelectedModel(event) {
  selection = 0;//Number(document.getElementById("modelList").selectedIndex) - 1;
  if (selection === -1) {
    return;
  } else {
    var txtColour = document.getElementById("colour");
    var txtAmbient = document.getElementById("ambient");
    var txtSpecular = document.getElementById("specular");
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

    setArrayToRgb(models[selection].ambient, hexToRgb(txtAmbient.value));
    setArrayToRgb(models[selection].specular, hexToRgb(txtSpecular.value));

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
}

function updateModelMenu() {
  selection = 0;//Number(document.getElementById("modelList").selectedIndex)-1;
  var txtColour = document.getElementById("colour");
  var txtAmbient = document.getElementById("ambient");
  var txtSpecular = document.getElementById("specular");
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
    txtSpecular.value = arrayToHex(models[selection].specular);
    txtAmbient.value = arrayToHex(models[selection].ambient);
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
}

function animateLight(light) {
  light.angle += light.angleStep;
  if (light.angle > 360)
    light.angle = 0;
  light.position[0] = light.radius * Math.cos(radians(light.angle));
  light.position[2] = light.radius * Math.sin(radians(light.angle));
}

var op = 0;

function render() {
  var requestAnimation = false;
  gl.clearColor(backColour[0], backColour[1], backColour[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  var val = Number(document.getElementById("a").value);
  gl.uniform1f(gl.getUniformLocation(program, "a"), val * 0.001, false);
  var val = Number(document.getElementById("b").value);
  gl.uniform1f(gl.getUniformLocation(program, "b"), val * 0.001, false);
  var val = Number(document.getElementById("c").value);
  gl.uniform1f(gl.getUniformLocation(program, "c"), val * 0.0001, false);

  gl.uniform1i(gl.getUniformLocation(program, "useLight"), true, false);
  gl.uniform1i(gl.getUniformLocation(program, "useTexture"), true, false);
  gl.uniform3fv(gl.getUniformLocation(program, "eyePosition"), [0, 0, 13], false);

  for (var l = 0; l < 2; l++) {
    if (lights[l].animate && lights[l].active) {
      animateLight(lights[l]);
      requestAnimation = true;
    }
  }

  if (models.length > 0) {
    var model = models[0];
    var sceneView = mat4();
    sceneView = mult(sceneView, translate(0, 0, -3));
    sceneView = mult(sceneView, rotate(txtSceneRotX, [1, 0, 0]));
    sceneView = mult(sceneView, rotate(txtSceneRotY, [0, 1, 0]));
    sceneView = mult(sceneView, rotate(txtSceneRotZ, [0, 0, 1]));
  }
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "matSceneView"), false, flatten(sceneView));

  for (var m = 0; m < models.length; m++) {
    var model = models[m];
    var modelView = mat4();
    modelView = mult(modelView, sceneView);
    modelView = mult(modelView, translate(model.position[0], model.position[1], model.position[2]));
    modelView = mult(modelView, rotate(model.rotation[0], [1, 0, 0]));
    modelView = mult(modelView, rotate(model.rotation[1], [0, 1, 0]));
    modelView = mult(modelView, rotate(model.rotation[2], [0, 0, 1]));
    modelView = mult(modelView, scalem(model.scale[0], model.scale[1], model.scale[2]));

    var ambientProduct = [];
    var diffuseProduct = [];
    var specularProduct = [];
    var lightPositions = [];

    for (var l = 0; l < 2; l++) {
      if (lights[l].active) {
        diffuseProduct[l] = mult(model.colour, lights[l].colour);
        specularProduct[l] = mult(model.specular, lights[l].specular);
      } else {
        diffuseProduct[l] = [0, 0, 0, 0];
        specularProduct[l] = [0, 0, 0, 0];
      }
      ambientProduct[l] = mult(model.ambient, lights[l].ambient);
      lightPositions[l] = lights[l].position;
    }

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPositions));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), model.shininess);

    gl.uniform4fv(vColour, model.colour);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "matModelView"), false, flatten(modelView));

    var normalMatrixx = normalMatrix(modelView);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "matNormal"), false, flatten(normalMatrixx));

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.points), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferId);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(vNormal);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferId);

    var aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
    gl.enableVertexAttribArray(aTextureCoord);
    if(document.getElementById("Mapping").value ==="Spherical")
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texCoords.spherical), gl.STATIC_DRAW);
    else if(document.getElementById("Mapping").value ==="Planar")
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texCoords.planar), gl.STATIC_DRAW);
    else
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texCoords.cylindrical), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBufferId);

    gl.activeTexture(gl.TEXTURE0);
    if (document.getElementById("Texture").value === "Mars") {
      gl.bindTexture(gl.TEXTURE_2D, texPluto);
    } else if (document.getElementById("Texture").value === "Check") {
      gl.bindTexture(gl.TEXTURE_2D, texCheck);
    } else {
      gl.uniform1i(gl.getUniformLocation(program, "useTexture"), false, false);

      gl.disableVertexAttribArray(aTextureCoord);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    gl.uniform1i(uSampler, 0);

    gl.drawArrays(gl.TRIANGLES, 0, model.points.length / 3);

    if (model.showLines) {
      gl.uniform4fv(vColour, model.lineColour);
      for (var i = 0; i < model.points.length / 3 - 3; i += 3) {
        gl.drawArrays(gl.LINE_LOOP, i, 3);
      }
    }
  }

  if (selection > -1) {
    //renderSelected(models[selection]);
  }

  //if(requestAnimation)
    requestAnimFrame(render);
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
  gl.uniform1i(gl.getUniformLocation(program, "useLight"), false, false);
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

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function arrayToHex(a) {
  return "#" + ((1 << 24) + (Math.round(255 * a[0]) << 16) + (Math.round(255 * a[1]) << 8) + Math.round(255 * a[2])).toString(16).slice(1);
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}