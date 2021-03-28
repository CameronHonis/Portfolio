import { Mesh, MeshParameters } from "./Mesh";
import { Triangle } from "./Triangle";
import { Vertex } from "./Vertex";
import icosphereData from "../meshData/icosphere.json";
import { vec3 } from "gl-matrix";

export class Icosphere extends Mesh {

  constructor({ 
    shaderProgram, 
    matrix, 
    shadeSmooth=true,
    color=[.7, .7, .7, 1], 
    axesScale=[1, 1, 1],
    ambientLight=.25,
  }: MeshParameters) {
    super({ matrix, shaderProgram, shadeSmooth, ambientLight, axesScale, color });
    for (const [ p0idx, p1idx, p2idx ] of icosphereData.faces) {
      const [ x0, y0, z0 ]: number[] = icosphereData.vertices[p0idx];
      const [ x1, y1, z1 ]: number[] = icosphereData.vertices[p1idx];
      const [ x2, y2, z2 ]: number[] = icosphereData.vertices[p2idx];
      const p0: vec3 = vec3.fromValues(x0, y0, z0);
      const p1: vec3 = vec3.fromValues(x1, y1, z1);
      const p2: vec3 = vec3.fromValues(x2, y2, z2);
      const p0Normal: vec3 = vec3.create();
      vec3.cross(p0Normal, p2, p1);
      vec3.normalize(p0Normal, p0Normal);
      const p1Normal: vec3 = vec3.create();
      vec3.cross(p1Normal, p0, p2);
      vec3.normalize(p1Normal, p1Normal);
      const p2Normal: vec3 = vec3.create();
      vec3.cross(p2Normal, p1, p0);
      vec3.normalize(p2Normal, p2Normal);
      this.triangles.push(new Triangle(
        new Vertex({position: p0, normal: p0Normal}),
        new Vertex({position: p1, normal: p1Normal}),
        new Vertex({position: p2, normal: p2Normal})
      ));
    }
  }
}