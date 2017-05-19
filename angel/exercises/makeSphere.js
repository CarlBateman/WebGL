function makeSphere() {
  return {
    vertexPositions: (setupPts()),
    vertexTextureCoords: [ ],
    vertexNormals: (setupPts()),
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

function setupPts() {
  var pts = [];
  setupTetra(pts, 3);
  for (var i = 0; i < pts.length; i++) {
    pts[i] = normalize(pts[i]);
  }
  return flatten(pts);
}

function setupTetra(points, numTimesToSubdivide) {
  var a = vec3(1, 0, 0);
  var b = vec3(0, 0, -1);
  var c = vec3(0, -1, 0);
  var d = vec3(0, 0, 1);
  var e = vec3(0, 1, 0);
  var f = vec3(-1, 0, 0);

  subdivideTri(a, c, b, numTimesToSubdivide, points);
  subdivideTri(a, d, c, numTimesToSubdivide, points);
  subdivideTri(a, e, d, numTimesToSubdivide, points);
  subdivideTri(a, b, e, numTimesToSubdivide, points);

  subdivideTri(f, b, c, numTimesToSubdivide, points);
  subdivideTri(f, c, d, numTimesToSubdivide, points);
  subdivideTri(f, d, e, numTimesToSubdivide, points);
  subdivideTri(f, e, b, numTimesToSubdivide, points);
}

function makeTriangle(a, b, c, points) {
  points.push(a, b, c);
}

function subdivideTri(a, b, c, n, points) {
  if (n === 0) {
    makeTriangle(a, b, c, points);
    return;
  }

  var ab = mix(a, b, 0.5);
  var bc = mix(b, c, 0.5);
  var ac = mix(a, c, 0.5);
  n--;

  subdivideTri(ab, bc, ac, n, points);
  subdivideTri(a, ab, ac, n, points);
  subdivideTri(ab, b, bc, n, points);
  subdivideTri(ac, bc, c, n, points);
}