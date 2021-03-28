import { mat4, vec3, vec4 } from "gl-matrix";
import { Triangle } from "./Triangle";

export interface MeshParameters {
  shaderProgram: WebGLProgram;
  matrix?: mat4;
  shadeSmooth?: boolean;
  color?: vec4;
  axesScale?: [number, number, number];
  ambientLight?: number;
}

export class Mesh {
  public triangles: Triangle[] = [];
  public matrix: mat4;
  public shaderProgram: WebGLProgram;
  public shadeSmooth: boolean;
  public ambientLight: number;
  public axesScale: vec3;
  public color: vec4;
  public worldArrayIdx: number = -1;
  constructor ({ 
    shaderProgram,
    matrix, 
    shadeSmooth=false, 
    color=[.7, .7, .7, 1], 
    axesScale=[1, 1, 1],
    ambientLight=.25
  }: MeshParameters) {
    if (!matrix) {
      matrix = mat4.create();
      mat4.identity(matrix);
    }
    this.matrix = matrix;
    this.shaderProgram = shaderProgram;
    this.shadeSmooth = shadeSmooth;
    this.ambientLight = ambientLight;
    this.axesScale = axesScale;
    this.color = color;
  }
}