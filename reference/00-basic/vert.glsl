attribute vec2 aVertex;

void main(void) {
  gl_Position = vec4(aVertex, 0.0, 1.0);
}
