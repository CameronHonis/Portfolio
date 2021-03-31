import { mat4, vec3, vec4 } from "gl-matrix";

export interface VertexParams {
  position?: vec3;
  color?: vec4;
  normal?: vec3;
  modelMatrix?: mat4;
  modelScale?: vec3;
}

export class Vertex {
  public x: number;
  public y: number;
  public z: number;
  public r: number;
  public g: number;
  public b: number;
  public a: number;
  public normalx: number;
  public normaly: number;
  public normalz: number;
  public modelMatrix?: mat4;
  public modelScale?: vec3;
  constructor (
    {
      position=vec3.create(),
      color=vec4.fromValues(.7,.7,.7,1),
      normal=vec3.fromValues(0, 0, 1),
      modelMatrix,
      modelScale,
    }: VertexParams
  ) {
    this.x = position[0];
    this.y = position[1];
    this.z = position[2];
    this.r = color[0];
    this.g = color[1];
    this.b = color[2];
    this.a = color[3];
    this.normalx = normal[0];
    this.normaly = normal[1];
    this.normalz = normal[2];
    this.modelMatrix = modelMatrix;
    this.modelScale = modelScale;
  }
}