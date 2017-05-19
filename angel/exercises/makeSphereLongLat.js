function makeSphere() {
  var pts = [];
  var norms = [];
  var textureCoords = {
    spherical: [],
    planar: [],
    cylindrical: []
  };

  function assignToTris(source, dest, lats) {
    for (var i = 0; i < source.length - lats - 2; i++) {
      var A = source[i];
      var B = source[i + 1];
      var C = source[i + lats + 1];
      var D = source[i + lats + 2];
      dest.push(A);
      dest.push(B);
      dest.push(C);

      dest.push(B);
      dest.push(C);
      dest.push(D);
    }
  }

  function setup() {
    var lats = 60,
      longs = 60,
      radius = 1.0,
      vertices = [],
      normals = [],
      indices = [];
      texCoords = {
        spherical: [],
        planar: [],
        cylindrical: []
      };

      for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
          var theta = latNumber * Math.PI / lats;
          var phi = longNumber * 2 * Math.PI / longs;
          var sinTheta = Math.sin(theta);
          var sinPhi = Math.sin(phi);
          var cosTheta = Math.cos(theta);
          var cosPhi = Math.cos(phi);

          var x = cosPhi * sinTheta;
          var y = cosTheta;
          var z = sinPhi * sinTheta;

          var n = vec3(x, y, z);
          normals.push(n);

          texCoords.spherical.push(vec2(
            1 - (longNumber / longs),
            1 - (latNumber / lats)
          ));

          texCoords.planar.push(vec2(x, y));

          // http://mathworld.wolfram.com/CylindricalCoordinates.html
          // http://keisan.casio.com/exec/system/1359534695
          texCoords.cylindrical.push(vec2(theta, cosPhi));

          var p = vec3(radius * x, y, radius * z);
          vertices.push(p);
        }
      }

    //for (var i = 0; i < vertices.length-lats-2; i++) {
        assignToTris(vertices, pts, lats);
        assignToTris(normals, norms, lats);
        assignToTris(texCoords.spherical, textureCoords.spherical, lats);
        assignToTris(texCoords.planar, textureCoords.planar, lats);
        assignToTris(texCoords.cylindrical, textureCoords.cylindrical, lats);
    //var A = vertices[i];
    //var B = vertices[i + 1];
    //var C = vertices[i + lats + 1];
    //var D = vertices[i + lats + 2];
    //pts.push(A);
    //pts.push(B);
    //pts.push(C);

    //pts.push(B);
    //pts.push(C);
    //pts.push(D);

    //var nA = normals[i];
    //var nB = normals[i + 1];
    //var nC = normals[i + lats + 1];
    //var nD = normals[i + lats + 2];
    //norms.push(nA);
    //norms.push(nB);
    //norms.push(nC);

    //norms.push(nB);
    //norms.push(nC);
    //norms.push(nD);
    //}

        textureCoords.spherical = flatten(textureCoords.spherical);
        textureCoords.planar = flatten(textureCoords.planar);
        textureCoords.cylindrical = flatten(textureCoords.cylindrical);
        pts = flatten(pts);
      norms = flatten(norms);
  }

  return {
    vertexPositions: (
          (function () {
            if (pts.length === 0) {
              setup();
            }
            return pts;
          })()
    ),
    vertexNormals: (
          (function () {
            if (norms.length === 0) {
              setup();
            }
            return norms;
          })()
    ),
    vertexTextureCoords:  (
          (function () {
            if (pts.length === 0) {
              setup();
            }
            return textureCoords;
          })()
    ),
    indices: [ ],
    colors: []
  }
};