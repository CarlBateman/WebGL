function makeCylinder() {
  var pts = [];
  var norms = [];

  function setup() {
    var numSides = 16;
    var angleStep = 2 * Math.PI / numSides;
    var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
    var numRows = 1;
    var rowStep = (3 / numRows) / 1.5;
    var O = angleStep;
    for (var i = 0; i < numSides; i++) {
      var cosO = Math.cos(O), sinO = Math.sin(O);
      var y1 = -numRows * rowStep / 2, y2 = y1 + rowStep;

      for (var r = 0; r < numRows; r++) {
        var A = vec3(cosO, y1, sinO);
        var B = vec3(cosO1, y1, sinO1);
        var C = vec3(cosO, y2, sinO);
        var D = vec3(cosO1, y2, sinO1);
        pts.push(A.slice(0), B.slice(0), D.slice(0));
        pts.push(D.slice(0), C.slice(0), A.slice(0));
        A[1] = 0;
        B[1] = 0;
        C[1] = 0;
        D[1] = 0;
        norms.push(A, B, D);
        norms.push(D, C, A);
        y1 = y2, y2 += rowStep;
      }
      cosO1 = cosO, sinO1 = sinO, O += angleStep;
    }

    // top cap
    var n = vec3(0, 1, 0);
    var y1 = numRows * rowStep / 2;
    var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
    var C = vec3(0, y1, 0);
    for (var i = 0; i < numSides; i++) {
      var cosO = Math.cos(O), sinO = Math.sin(O);
      var A = vec3(cosO, y1, sinO);
      var B = vec3(cosO1, y1, sinO1);
      pts.push(C, A, B);
      norms.push(n, n, n);
      cosO1 = cosO, sinO1 = sinO, O += angleStep;
    }

    // base cap
    var n = vec3(0, -1, 0);
    var y1 = -numRows * rowStep / 2;
    var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
    var C = vec3(0, y1, 0);
    for (var i = 0; i < numSides; i++) {
      var cosO = Math.cos(O), sinO = Math.sin(O);
      var A = vec3(cosO, y1, sinO);
      var B = vec3(cosO1, y1, sinO1);
      pts.push(A, C, B);
      norms.push(n, n, n);
      cosO1 = cosO, sinO1 = sinO, O += angleStep;
    }

    pts = flatten(pts);
    norms = flatten(norms);
  }

  return {
    vertexPositions: (
          (function () {
            if (pts.length === 0) {
              setup();
            }
            //console.log(pts);
            return pts;
          })()
    ),
    vertexNormals: (
          (function () {
            if (pts.length === 0) {
              setup();
            }
            //console.log(norms);
            return norms;
          })()
    ),
    vertexTextureCoords: [],
    indices: [
          0, 1, 2, 0, 2, 3,    // Front face
          4, 5, 6, 4, 6, 7,    // Back face
          8, 9, 10, 8, 10, 11,  // Top face
          12, 13, 14, 12, 14, 15, // Bottom face
          16, 17, 18, 16, 18, 19, // Right face
          20, 21, 22, 20, 22, 23  // Left face
    ],
    colors: (function () {
      var packedColors = [
          [0.0, 1.0, 1.0, 1.0], // Front face
          [1.0, 1.0, 0.0, 1.0], // Back face
          [0.0, 1.0, 0.0, 1.0], // Top face
          [1.0, 0.0, 1.0, 1.0], // Bottom face
          [1.0, 0.0, 0.0, 1.0], // Right face
          [0.0, 0.0, 1.0, 1.0] // Left face
      ];
      var unpackedColors = [];
      for (var i in packedColors) {
        var color = packedColors[i];
        for (var j = 0; j < 4; j++) {
          unpackedColors = unpackedColors.concat(color);
        }
      }
      return unpackedColors;
    }())
  }
};