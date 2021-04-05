precision mediump float;
precision mediump int;

attribute vec4 modelPosition;
attribute lowp vec4 modelNormal;

uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform vec3 highlightData0; // x, y reps absolute coords, z reps radius
uniform vec3 highlightData1;
uniform vec3 highlightData2;
uniform vec3 highlightColor;
uniform float t;
uniform float terrainLength;
uniform float introAnimTime;

varying vec4 position;
varying vec4 color;

void main(void) {
  position = modelMatrix * modelPosition;
  float maxOpacity = 0.0;
  vec3 adjColor = highlightColor / 255.0;
  if (t < introAnimTime) {
    //intro
    float relDis = -position.z / terrainLength;
    float relT = t / introAnimTime;
    adjColor = vec3(1.0, 1.0, 1.0);
    if (3.0*relT - .75 - relDis > 0.0) {
      maxOpacity = clamp(relDis - 3.0*relT + 1.5, 0.0, 1.0);
    }
  } else {
    float x0 = distance(highlightData0.xy, position.xz) / highlightData0.z;
    float x1 = distance(highlightData1.xy, position.xz) / highlightData1.z;
    float x2 = distance(highlightData2.xy, position.xz) / highlightData2.z;
    maxOpacity = max(maxOpacity, 1.0 - pow(x0, 4.0));
    maxOpacity = max(maxOpacity, 1.0 - pow(x1, 4.0));
    maxOpacity = max(maxOpacity, 1.0 - pow(x2, 4.0));
  }
  color = vec4(adjColor, maxOpacity);
  gl_Position = projectionMatrix * position;
}