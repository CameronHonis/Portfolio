precision mediump float;
precision mediump int;

attribute vec4 modelPosition;
attribute lowp vec4 modelNormal;

uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraLightPosition;
uniform mat4 modelMatrix;
uniform float ambientLight;
uniform float t;
uniform float terrainLength;
uniform float introAnimTime;

varying vec4 color;
varying vec4 position;

float getLuminance(vec4 normal) {
  vec4 lightPosition = cameraMatrix * vec4(cameraLightPosition, 1.0);
  vec3 vertexToCam = cameraMatrix[3].xyz - position.xyz;
  vec3 lightToVertex = position.xyz - lightPosition.xyz;
  vec3 lightReflect = reflect(lightToVertex, normal.xyz);
  float funcX = dot(normalize(lightReflect), normalize(vertexToCam));
  if (funcX <= .938) {
    return max(0.0, .4*funcX);
  } else {
    return 10.0*funcX - 9.0;
  }
}

void main(void) {
  position = modelMatrix * modelPosition;
  vec4 normal = normalize(mat4(modelMatrix[0], modelMatrix[1], modelMatrix[2], vec4(0, 0, 0, 1))*modelNormal);
  vec4 adjColor = vec4(.05, .05, .225, 1.0);
  if (t < introAnimTime) {
    // in intro
    float relDis = -position.z / terrainLength;
    float relT = t / introAnimTime;
    // tile visible
    if (3.0*relT - 1.0 - relDis > 0.0) {
      adjColor = mix(vec4(1.0, 1.0, 1.0, 1.0), vec4(.05, .05, .225, 1.0), clamp(3.0*relT - 1.0 - relDis, 0.0, 1.0));
    } else {
      adjColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  }
  gl_Position = projectionMatrix * position;
  float luminance = getLuminance(normal);
  color = mix(vec4(0, 0, 0, adjColor.a), adjColor, ambientLight + (1.0 - ambientLight)*luminance);
}