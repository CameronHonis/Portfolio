import { mat4, vec3, vec4 } from "gl-matrix";
import { Triangle } from "./Triangle";

export interface MeshParameters {
  shaderProgram: WebGLProgram;
  matrix?: mat4;
  shadeSmooth?: boolean;
  axesScale?: [number, number, number];
  ambientLight?: number;
  name?: string;
}

export class Mesh {
  public triangles: Triangle[] = [];
  public matrix: mat4;
  public shaderProgram: WebGLProgram;
  public shadeSmooth: boolean;
  public ambientLight: number;
  public axesScale: vec3;
  public worldArrayIdx: number = -1;
  public name?: string;
  constructor ({ 
    shaderProgram,
    matrix, 
    shadeSmooth=false, 
    axesScale=[1, 1, 1],
    ambientLight=.25,
    name,
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
    this.name = name;
  }

  removeTriangle(idx: number): void {
    if (idx < 0 || idx >= this.triangles.length) return;
    for (let i = idx + 1; i < this.triangles.length; ++i) {
      if (!this.triangles[i].meshArrayIdx) continue;
      this.triangles[i].meshArrayIdx!--;
    }
    this.triangles.splice(idx, 1);
  }

  updateVertices(): void {
    for (const tri of this.triangles) {
      tri.p0.modelMatrix = this.matrix;
      tri.p1.modelMatrix = this.matrix;
      tri.p2.modelMatrix = this.matrix;
      tri.p0.modelScale = this.axesScale;
      tri.p1.modelScale = this.axesScale;
      tri.p2.modelScale = this.axesScale;
    }
  }
}