function initShaderProgram(gl, vertId, fragId) {
  //var fragmentShader = fragId.includes(".") ? getShaderFromFile(gl, fragId) : getShaderFromScriptTagID(gl, fragId);
  var fragmentShader = getShaderFromScriptTagID(gl, fragId);
  if (fragmentShader === null) {
    console.log("No fragment shader code defined");
    return null;
  }

  //var vertexShader = vertId.includes(".") ? getShaderFromFile(gl, vertId) : getShaderFromScriptTagID(gl, vertId);
  var vertexShader = getShaderFromScriptTagID(gl, vertId);
  if (vertexShader === null) {
    console.log("No vertex shader code defined");
    return null;
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(shaderProgram));
  }

  gl.useProgram(shaderProgram);

  return shaderProgram;
}

function getShaderFromScriptTagID(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type.includes("frag") || id.includes("frag")) {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type.includes("vert") || id.includes("vert")) {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function loadShaderProgram(gl, vertId, fragId, cb) {
  getShaderFromFile(gl, fragId, function (fragmentShader) {
    if (fragmentShader === null) {
      console.log("No fragment shader code defined");
      cb(null);
    }

    getShaderFromFile(gl, vertId, function (vertexShader) {
      if (vertexShader === null) {
        console.log("No vertex shader code defined");
        cb(null);
      }

      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(shaderProgram));
      }

      gl.useProgram(shaderProgram);

      cb(shaderProgram);
    });
  });
}

function getShaderFromFile(gl, url, cb) {
  var xhr = new XMLHttpRequest();
  var shader;

  xhr.open("GET", url, true);

  xhr.onload = function () {
    if (xhr.status < 200 || xhr.status > 299) {
      console.log('Fatal error getting shader');
      console.log('Error: HTTP Status ' + xhr.status + ' on resource ' + url);
      return;
    } else {

      var str = xhr.responseText;
      
      if (url.includes("frag")) {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
      } else if (url.includes("vert")) {
        shader = gl.createShader(gl.VERTEX_SHADER);
      } else {
        cb(null);
      }

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        cb(null);
      }
      cb(shader)
    }
  }
  xhr.send();
}

function getTextFromFile(url) {
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);

  xhr.onload = function () {
    if (xhr.status < 200 || xhr.status > 299) {
      // error
      console.log('Fatal error getting text');
      console.log('Error: HTTP Status ' + request.status + ' on resource ' + url);
      return;
    } else {
      var str = xhr.responseText;
    }
  }
  xhr.send();
  return shader;
}