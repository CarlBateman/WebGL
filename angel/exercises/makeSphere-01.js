function makeSphere() {
  return {
    vertexPositions: (
          (function () {
            var pts = [];


            var numSides = 8; // segments
            var numRows = 4; // slices
            var lonStep = 2 * Math.PI / numSides;
            var latStep = Math.PI / numRows;
            var lat = latStep - Math.PI; // NS phi
            var lon = lonStep; // EW lambda

            // just generate all the points
            for (var i = 0; i < numSides; i++) {
              for (var r = 0; r < numRows; r++) {
                var cos1 = Math.cos(lon), sin1 = Math.sin(lon);
                var cos2 = Math.cos(lat), sin2 = Math.sin(lat);

                var A = vec3(cos1 * sin2, cos2, sin1 * sin2);
                pts.push(A);

                lat += latStep;
              }
              lon += lonStep;
            }

            //// top cap
            //var y1 = numRows * latStep / 2;
            //var cos1 = Math.cos(0), sin1 = Math.sin(0);
            //var C = vec3(0, y1, 0);
            //for (var i = 0; i < numSides; i++) {
            //  var cos2 = Math.cos(lon), sin2 = Math.sin(lon);
            //  var A = vec3(cos2, y1, sin2);
            //  var B = vec3(cos1, y1, sin1);
            //  pts.push(C, A, B);
            //  cos1 = cos2, sin1 = sin2, lon += lonStep;
            //}

            //// base cap
            //var y1 = -numRows * latStep / 2;
            //var cos1 = Math.cos(0), sin1 = Math.sin(0);
            //var C = vec3(0, y1, 0);
            //for (var i = 0; i < numSides; i++) {
            //  var cos2 = Math.cos(lon), sin2 = Math.sin(lon);
            //  var A = vec3(cos2, y1, sin2);
            //  var B = vec3(cos1, y1, sin1);
            //  pts.push(C, A, B);
            //  cos1 = cos2, sin1 = sin2, lon += lonStep;
            //}

            console.log(flatten(pts))
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