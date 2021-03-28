precision mediump float;
precision mediump int;

attribute vec4 modelVertexPosition;
attribute vec4 modelVertexNormal;

uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;
uniform vec3 lightPosition;
uniform mat4 modelMatrix;
uniform lowp int shadeSmooth;
uniform float ambientLight;
uniform lowp vec3 axesScale;
uniform lowp vec4 modelColor;

varying vec4 vertexColor0;
varying vec4 vertexPosition;

float getLuminance(vec4 vertexPosition, vec4 vertexNormal) {
  vec3 vertexToCam = cameraMatrix[3].xyz - vertexPosition.xyz;
  vec3 lightToVertex = vertexPosition.xyz - lightPosition;
  vec3 lightReflect = reflect(lightToVertex, vertexNormal.xyz);
  return pow(.5 + .5*dot(normalize(lightReflect), normalize(vertexToCam)), 4.);
}

void main(void) {
  vec4 scaledModelVertexPosition = modelVertexPosition * vec4(axesScale, 1);
  vertexPosition = modelMatrix * scaledModelVertexPosition;
  vec4 vertexNormal;
  if (shadeSmooth == 1) {
    vertexNormal = normalize(vertexPosition - modelMatrix[3]);
  } else {
    vertexNormal = normalize(mat4(modelMatrix[0], modelMatrix[1], modelMatrix[2], vec4(0, 0, 0, 1))*modelVertexNormal);
  }
  vec4 projVertexPosition = projectionMatrix * vertexPosition;
  gl_Position = projVertexPosition;
  float luminance = getLuminance(vertexPosition, vertexNormal);
  vertexColor0 = modelColor;
  vertexColor0 = mix(vertexColor0, vec4(0.0, 0.0, 0.0, vertexColor0[3]), (1.0 - ambientLight)*(1.0 - luminance));
}