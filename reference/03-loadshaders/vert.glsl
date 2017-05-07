attribute vec2 aVertex;
uniform vec2 uScale;
varying vec2 vPos;

void main(void) {
  vPos = aVertex * 2.0;
  gl_Position = vec4(aVertex * uScale, 0.0, 1.0);
}
