precision mediump float;
precision mediump int;

uniform int screenHeight;
uniform lowp float fogStart;
uniform lowp float fogEnd;
uniform lowp float fogMin;
uniform lowp float fogMax;
uniform lowp vec3 fogTransform;
uniform mat4 cameraMatrix;

varying vec4 vertexColor0;
varying vec4 vertexPosition;

vec4 getFogColor(void) {
  float relProjY = 1.0 - float(gl_FragCoord.y)/float(screenHeight);
  // rgba(97, 97, 112, 255) top to rgba(15, 15, 30, 255) bottom
  vec4 fogColor = mix(vec4(.3804, .3804, .4392, 1), vec4(.0588, .0588, .1176, 1), relProjY);
  return fogColor;
}

float getFogIntensity(float cameraDistance) {
  float fogIntensity = ((cameraDistance - fogStart)*(fogMax - fogMin) + fogMin*(fogEnd - fogStart)) / (fogEnd - fogStart);
  fogIntensity = min(fogMax, max(fogMin, fogTransform[2]*fogIntensity*fogIntensity + fogTransform[1]*fogIntensity + fogTransform[0]));
  fogIntensity = clamp(fogIntensity, fogMin, fogMax);
  return fogIntensity;
}

void main(void) {
  float cameraDistance = distance(cameraMatrix[3].xyz, vertexPosition.xyz);
  vec4 fogColor = getFogColor();
  float fogIntensity = getFogIntensity(cameraDistance);
  vec4 vertexColor1 = mix(vertexColor0, fogColor, fogIntensity);
  gl_FragColor = vertexColor1;
}