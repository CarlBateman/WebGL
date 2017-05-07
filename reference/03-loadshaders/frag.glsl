precision mediump float;
uniform vec4 uColour;
varying vec2 vPos;

void main(void) {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  vec2 z = vPos;
  float x,y;
  float dist = 0.0;

  for (int i=0;i<255;i++) {
    x = (z.x * z.x - z.y * z.y) + vPos.x;
    y = (z.y * z.x + z.x * z.y) + vPos.y;

    dist += (x*x  +  y*y);

    if((x * x + y * y) > 4.0) {
      float c = cos(float(i));
      float s = sin(float(i));
      float f = float(255-i)/255.0;

          
          
      gl_FragColor = vec4(s,c,f, 1.0);
      //gl_FragColor = vec4(r,r,r, 1.0);
      break;
    } else {
      if(i==254) {
        float r = cos(1.0 * sqrt(dist));
        gl_FragColor = vec4(r,r,r, 1.0);
      }

    }
    z.x = x;
    z.y = y;
  }

  //if(vPos.x*vPos.x + vPos.y*vPos.y > 2.0)
  //    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
      
}