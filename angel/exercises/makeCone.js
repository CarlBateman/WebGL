function makeCone() {
  var pts = [];
  var norms = [];

  function setup() {
    var numSides = 16;
    var angleStep = 2 * Math.PI / numSides;
    var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
    var numRows = 1;
    var rowStep = (3 / numRows) / 1.5;
    var O = angleStep;
    var y1 = numRows * rowStep / 2;

    // top point
    var A = vec3(0, y1, 0);

    // sides
    var y1 = -numRows * rowStep / 2;
    var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
    var C = vec3(0, y1, 0);
    for (var i = 0; i < numSides; i++) {
      var cosO = Math.cos(O), sinO = Math.sin(O);
      var C = vec3(cosO, y1, sinO);
      var B = vec3(cosO1, y1, sinO1);
      pts.push(A, C, B);

      var n = normalize(cross(subtract(A, C), subtract(A, B)));
      norms.push(n, n, n);

      cosO1 = cosO, sinO1 = sinO, O += angleStep;
    }

    // base cap
    var n = vec3(0, -1, 0);
    var y1 = -numRows * rowStep / 2;
    var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
    var A = vec3(0, y1, 0);
    for (var i = 0; i < numSides; i++) {
      var cosO = Math.cos(O), sinO = Math.sin(O);
      var C = vec3(cosO, y1, sinO);
      var B = vec3(cosO1, y1, sinO1);
      pts.push(A, B, C);
      var n = vec3(0, -1, 0);
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