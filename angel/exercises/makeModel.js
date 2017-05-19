function makeModel() {
  return {
    name: "",
    type: "",
    points: [],
    normals: [],
    texCoords: {
      spherical: [],
      planar: [],
      cylindrical: []
    },
    colour: [1, 1, 1, 1],  // diffuse same as
    //diffuse: [1, 1, 1, 1], // colour
    specular: [1, 1, 1, 1],
    ambient: [1, 1, 1, 1],
    emission: [0, 0, 0, 1],
    shininess: 100,

    lineColour: [1, 1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    showLines: false,
    showBody: true,
  }
}