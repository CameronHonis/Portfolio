import { vec3, vec4 } from "gl-matrix";

export interface VertexParams {
  position?: vec3;
  normal?: vec3;
}

export class Vertex {
  public x: number;
  public y: number;
  public z: number;
  public normalx: number;
  public normaly: number;
  public normalz: number;

  constructor (
    {
      position=vec3.create(),
      normal=vec3.fromValues(0, 0, 1)
    }: VertexParams
  ) {
    this.x = position[0];
    this.y = position[1];
    this.z = position[2];
    this.normalx = normal[0];
    this.normaly = normal[1];
    this.normalz = normal[2];
  }
}