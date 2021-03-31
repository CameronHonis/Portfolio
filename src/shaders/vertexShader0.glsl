precision mediump float;
precision mediump int;

attribute vec4 modelVertexPosition;
attribute vec4 modelVertexNormal;
attribute vec4 vertexColor;
attribute vec4 overrideMatrixRV;
attribute vec4 overrideMatrixUV;
attribute vec4 overrideMatrixLV;
attribute vec4 overrideMatrixPos;
attribute vec3 overrideScale;
attribute lowp float overrideModelData;

uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;
uniform vec3 lightPosition;
uniform mat4 modelMatrix;
uniform lowp int shadeSmooth;
uniform float ambientLight;
uniform lowp vec3 axesScale;

varying vec4 vertexColor0;
varying vec4 vertexPosition;

float getLuminance(vec4 vertexPosition, vec4 vertexNormal) {
  vec3 vertexToCam = cameraMatrix[3].xyz - vertexPosition.xyz;
  vec3 lightToVertex = vertexPosition.xyz - lightPosition;
  vec3 lightReflect = reflect(lightToVertex, vertexNormal.xyz);
  return pow(.5 + .5*dot(normalize(lightReflect), normalize(vertexToCam)), 2.5);
}

void main(void) {
  vec3 scale;
  mat4 matrix;
  if (overrideModelData == 1.0) {
    scale = overrideScale;
    matrix = mat4(overrideMatrixRV, overrideMatrixUV, overrideMatrixLV, overrideMatrixPos);
  } else {
    scale = axesScale;
    matrix = modelMatrix;
  }
  vec4 scaledModelVertexPosition = modelVertexPosition * vec4(scale, 1);
  vertexPosition = matrix * scaledModelVertexPosition;
  vec4 vertexNormal;
  if (shadeSmooth == 1) {
    vertexNormal = normalize(vertexPosition - matrix[3]);
  } else {
    vertexNormal = normalize(mat4(matrix[0], matrix[1], matrix[2], vec4(0, 0, 0, 1))*modelVertexNormal);
  }
  vec4 projVertexPosition = projectionMatrix * vertexPosition;
  gl_Position = projVertexPosition;
  float luminance = getLuminance(vertexPosition, vertexNormal);
  vertexColor0 = vertexColor;
  vertexColor0 = mix(vertexColor0, vec4(0.0, 0.0, 0.0, vertexColor0[3]), (1.0 - ambientLight)*(1.0 - luminance));
}