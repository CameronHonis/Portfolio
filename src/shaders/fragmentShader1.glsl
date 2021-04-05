precision mediump float;
precision mediump int;

uniform int screenHeight;
uniform lowp float fogStart;
uniform lowp float fogEnd;
uniform lowp float fogMin;
uniform lowp float fogMax;
uniform lowp vec3 fogTransform;
uniform mat4 cameraMatrix;

varying vec4 color;
varying vec4 position;

vec4 getFogColor(void) {
  float relProjY = 1.0 - float(gl_FragCoord.y)/float(screenHeight);
  vec4 fogColor = mix(vec4(.3804, .3804, .4392, 1.0), vec4(.0588, .0588, .1176, 1.0), relProjY);
  return fogColor;
}

float getFogIntensity(float cameraDistance) {
  float fogIntensity = ((cameraDistance - fogStart)*(fogMax - fogMin) + fogMin*(fogEnd - fogStart)) / (fogEnd - fogStart);
  fogIntensity = min(fogMax, max(fogMin, fogTransform[2]*fogIntensity*fogIntensity + fogTransform[1]*fogIntensity + fogTransform[0]));
  fogIntensity = clamp(fogIntensity, fogMin, fogMax);
  return fogIntensity;
}

void main(void) {
  float cameraDistance = distance(cameraMatrix[3].xyz, position.xyz);
  vec4 fogColor = getFogColor();
  float fogIntensity = getFogIntensity(cameraDistance);
  vec4 color = mix(color, fogColor, fogIntensity);
  gl_FragColor = color;
}