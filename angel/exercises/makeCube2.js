function makeCube2() {
  return {
    vertexPositions: (
          (function () {
            var pts = [];


            var numSides = 8;
            var angleStep = 2 * Math.PI / numSides;
            var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
            var numRows = 8;
            var rowStep = 3 / numRows;
            var O = angleStep;
            for (var i = 0; i<numSides; i++) {
              var cosO = Math.cos(O), sinO = Math.sin(O);
              var y1 = -numRows*rowStep/2, y2 = y1+rowStep;

              for (var r = 0; r < numRows; r++) {
                var A = vec3(cosO, y1, sinO);
                var B = vec3(cosO1, y1, sinO1);
                var C = vec3(cosO, y2, sinO);
                var D = vec3(cosO1, y2, sinO1);
                pts.push(A, B, D);
                pts.push(D, C, A);
                y1 = y2, y2 += rowStep;
              }
              cosO1 = cosO, sinO1 = sinO, O += angleStep;
            }

            // top cap
            var y1 = numRows * rowStep / 2;
            var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
            var C = vec3(0, y1, 0);
            for (var i = 0; i < numSides; i++) {
              var cosO = Math.cos(O), sinO = Math.sin(O);
              var A = vec3(cosO, y1, sinO);
              var B = vec3(cosO1, y1, sinO1);
              pts.push(C, A, B);
              cosO1 = cosO, sinO1 = sinO, O += angleStep;
            }

            // base cap
            var y1 = -numRows * rowStep / 2;
            var cosO1 = Math.cos(0), sinO1 = Math.sin(0);
            var C = vec3(0, y1, 0);
            for (var i = 0; i < numSides; i++) {
              var cosO = Math.cos(O), sinO = Math.sin(O);
              var A = vec3(cosO, y1, sinO);
              var B = vec3(cosO1, y1, sinO1);
              pts.push(C, A, B);
              cosO1 = cosO, sinO1 = sinO, O += angleStep;
            }

            for (var i = 0; i < pts.length; i++) {
              pts[i] = normalize(pts[i]);

            }

            return flatten(pts);
          })()
    ),
    vertexTextureCoords: [
          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 63 / 304,
          0.0, 63 / 304,

          // Back face
          0.0, 241 / 304,
          1.0, 241 / 304,
          1.0, 1.0,
          0.0, 1.0,

          // Top face
          0.0, 0.197,
          1.0, 0.197,
          1.0, 0.407,
          0.0, 0.407,

          // Bottom face
          0.0, 0.332,
          1.0, 0.332,
          1.0, 0.539,
          0.0, 0.539,

          // Right face
          0.0, 161 / 304,
          1.0, 161 / 304,
          1.0, 223 / 304,
          0.0, 223 / 304,

          // Left face
          0.0, 201 / 304,
          1.0, 201 / 304,
          1.0, 263 / 304,
          0.0, 263 / 304
    ],
    vertexNormals: [
              // Front face
               0.0, 0.0, 1.0,
               0.0, 0.0, 1.0,
               0.0, 0.0, 1.0,
               0.0, 0.0, 1.0,

              // Back face
               0.0, 0.0, -1.0,
               0.0, 0.0, -1.0,
               0.0, 0.0, -1.0,
               0.0, 0.0, -1.0,

              // Top face
               0.0, 1.0, 0.0,
               0.0, 1.0, 0.0,
               0.0, 1.0, 0.0,
               0.0, 1.0, 0.0,

              // Bottom face
               0.0, -1.0, 0.0,
               0.0, -1.0, 0.0,
               0.0, -1.0, 0.0,
               0.0, -1.0, 0.0,

              // Right face
               1.0, 0.0, 0.0,
               1.0, 0.0, 0.0,
               1.0, 0.0, 0.0,
               1.0, 0.0, 0.0,

              // Left face
              -1.0, 0.0, 0.0,
              -1.0, 0.0, 0.0,
              -1.0, 0.0, 0.0,
              -1.0, 0.0, 0.0
    ],
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