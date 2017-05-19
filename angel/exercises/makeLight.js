function makeLight() {
  return {
    name: "",
    type: "",
    colour: [1, 1, 1, 1],
    ambient: [0.1, 0.1, 0.1, 1],
    specular: [1, 1, 1, 1],

    falloff: 0,

    position: [0, 0, 0, 0],
    angle: 0,
    angleStep: 0.1,
    radius: 0,
    rotation: [0, 0, 0],

    animate: true,
    active: true,
  }
}