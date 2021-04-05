import { Vertex } from "./Vertex";

export class Triangle {
  public p0: Vertex;
  public p1: Vertex;
  public p2: Vertex;
  public meshArrayIdx?: number;
  constructor (
    p0: Vertex, 
    p1: Vertex, 
    p2: Vertex,
    idx?: number
  ) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.meshArrayIdx = idx;
  }
}