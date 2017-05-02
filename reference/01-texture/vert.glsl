uniform vec2 uScale;

attribute vec2 aVertex;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main(void) {
  gl_Position = vec4(aVertex * uScale, 0.0, 1.0);
  vTextureCoord = aTextureCoord;
}
