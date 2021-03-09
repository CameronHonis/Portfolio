import { Helpers } from "./Helpers";

export class V3 {
  public x: number;
  public y: number;
  public z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  scale(scalar: number): V3 {
    return new V3(this.x*scalar, this.y*scalar, this.z*scalar);
  }

  add(v3: V3): V3 {
    return new V3(this.x + v3.x, this.y + v3.y, this.z + v3.z);
  }

  sign(): V3 {
    return new V3(Math.sign(this.x), Math.sign(this.y), Math.sign(this.z));
  }

  abs(): V3 {
    return new V3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
  }

  dot(v3: V3): number {
    return this.x*v3.x + this.y*v3.y + this.z*v3.z;
  }

  cross(v3: V3): V3 {
    return new V3(
      this.y*v3.z - this.z*v3.y,
      this.z*v3.x - this.x*v3.z,
      this.x*v3.y - this.y*v3.x
    );
  }

  mag(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
  }

  unit(): V3 {
    return this.scale(1/this.mag());
  }

  equals(that: V3): boolean {
    return this.x === that.x && this.y === that.y && this.z === that.z;
  }

  toString(sigFigs: number = 4, sciNot: boolean = false): string {
    sigFigs = Math.max(sigFigs, 1);
    if (sciNot) {
      return "<" + Helpers.sciNot(this.x, sigFigs) + ", " + Helpers.sciNot(this.y, sigFigs)
        + ", " + Helpers.sciNot(this.z, sigFigs) + ">";
    } else {
      const xPow10: number = Math.floor(Math.log10(Math.abs(this.x)));
      const yPow10: number = Math.floor(Math.log10(Math.abs(this.y)));
      const zPow10: number = Math.floor(Math.log10(Math.abs(this.z)));
      return "<" + Helpers.roundToPow(this.x, xPow10 - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.y, yPow10 - sigFigs + 1) + ", " 
        + Helpers.roundToPow(this.z, zPow10 - sigFigs + 1) + ">";
    }
  }
}