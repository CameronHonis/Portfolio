import { Helpers } from "./Helpers";
import { Tri } from "./Tri";
import { V2 } from "./V2";

export class M2 {
  /*
    2x2 matrix
    Represents line in 2d space of format:
    
    x0 y0 --> p0
    x1 y1 --> p1

  */

  public x0: number;
  public y0: number;
  public x1: number;
  public y1: number;

  constructor(p0: V2, p1: V2)
  constructor(x0: number, y0: number, x1: number, y1: number)
  constructor(...args: any) {
    if (args.length === 2 && args[0] instanceof V2) {
      this.x0 = args[0].x;
      this.y0 = args[0].y;
      this.x1 = args[1].x;
      this.y1 = args[1].y;
    } else if (args.length === 4 && typeof args[0] === "number") {
      this.x0 = args[0];
      this.y0 = args[1];
      this.x1 = args[2];
      this.y1 = args[3];
    } else {
      throw new Error("Error constructing M2, unhandled parameter types: " + Helpers.listTypes(args));
    }
  }

  intersect(that: M2, uncapped: boolean = false): V2 | null {
    const denom: number = (this.x0 - this.x1)*(that.y0 - that.y1) - (this.y0 - this.y1)*(that.x0 - that.x1);
    if (denom === 0) { return null; }
    const bezT: number = ((this.x0 - that.x0)*(that.y0 - that.y1) - (this.y0 - that.y0)*(that.x0 - that.x1)) / denom;
    const bezU: number = ((this.x1 - this.x0)*(this.y0 - that.y0) - (this.y1 - this.y0)*(this.x0 - that.x0)) / denom;
    if (!uncapped && (bezT < 0 || bezT > 1 || bezU < 0 || bezU > 1)) { return null; }
    return new V2(this.x0 + bezT*(this.x1 - this.x0), this.y0 + bezT*(this.y1 - this.y0));
  }

  collinear(p: V2, threshold: number = .001): boolean {
    // check "outter" bounds of line's bounding box (angle check takes care of "inner" bounds)
    // relative to <x0, y0>
    if (this.x0 < this.x1) { // expanded logic to save computations
      if (p.x > this.x1 + threshold) { return false; }
    } else {
      if (p.x < this.x1 - threshold) { return false; }
    }
    if (this.y0 < this.y1) {
      if (p.y > this.y1 + threshold) { return false; }
    } else {
      if (p.y < this.y1 - threshold) { return false; }
    }
    const thisAngle: number = new V2(this.x1, this.y1).add(new V2(this.x0, this.y0).scale(-1)).originAngle();
    const this0pAngle: number = new V2(p.x, p.y).add(new V2(this.x0, this.y0).scale(-1)).originAngle();
    const dAngle: number = thisAngle - this0pAngle;
    return Math.min(Math.abs(dAngle), Math.abs(dAngle + Math.sign(-dAngle)*Math.PI*2)) <= threshold;
  }

  negateFromTri(tri: Tri): M2[] {
    const thisTri01: V2 | null = new M2(tri.p0, tri.p1).intersect(this);
    const thisTri02: V2 | null = new M2(tri.p0, tri.p2).intersect(this);
    const thisTri12: V2 | null = new M2(tri.p1, tri.p2).intersect(this);
    const this0inTri: boolean = tri.pointInscribed(new V2(this.x0, this.y0));
    const this1inTri: boolean = tri.pointInscribed(new V2(this.x1, this.y1));
    if (!thisTri01 && !thisTri02 && !thisTri12 && !this0inTri && !this1inTri) { return [this]; }
    if (this0inTri && this1inTri) { return []; }
    if (thisTri01 && thisTri02) {
      if (thisTri01.add(thisTri02.scale(-1)).dot(new V2(this.x0, this.y0).add(thisTri02.scale(-1))) > 0) {
        return [new M2(this.x0, this.y0, thisTri01.x, thisTri01.y), new M2(this.x1, this.y1, thisTri02.x, thisTri02.y)];
      } else {
        return [new M2(this.x1, this.y1, thisTri01.x, thisTri01.y), new M2(this.x0, this.y0, thisTri02.x, thisTri02.y)];
      }
    } else if (thisTri01 && thisTri12) {
      if (thisTri01.add(thisTri12.scale(-1)).dot(new V2(this.x0, this.y0).add(thisTri12.scale(-1))) > 0) {
        return [new M2(this.x0, this.y0, thisTri01.x, thisTri01.y), new M2(this.x1, this.y1, thisTri12.x, thisTri12.y)];
      } else {
        return [new M2(this.x1, this.y1, thisTri01.x, thisTri01.y), new M2(this.x0, this.y0, thisTri12.x, thisTri12.y)];
      }
    } else if (thisTri02 && thisTri12) {
      if (thisTri02.add(thisTri12.scale(-1)).dot(new V2(this.x0, this.y0).add(thisTri12.scale(-1))) > 0) {
        return [new M2(this.x0, this.y0, thisTri02.x, thisTri02.y), new M2(this.x1, this.y1, thisTri12.x, thisTri12.y)];
      } else {
        return [new M2(this.x1, this.y1, thisTri02.x, thisTri02.y), new M2(this.x0, this.y0, thisTri12.x, thisTri12.y)];
      }
    } else if (thisTri01) {
      if (tri.pointInscribed(new V2(this.x0, this.y0))) {
        return [new M2(this.x1, this.y1, thisTri01.x, thisTri01.y)];
      } else {
        return [new M2(this.x0, this.y0, thisTri01.x, thisTri01.y)];
      }
    } else if (thisTri02) {
      if (tri.pointInscribed(new V2(this.x0, this.y0))) {
        return [new M2(this.x1, this.y1, thisTri02.x, thisTri02.y)];
      } else {
        return [new M2(this.x0, this.y0, thisTri02.x, thisTri02.y)];
      }
    } else if (thisTri12) {
      if (tri.pointInscribed(new V2(this.x0, this.y0))) {
        return [new M2(this.x1, this.y1, thisTri12.x, thisTri12.y)];
      } else {
        return [new M2(this.x0, this.y0, thisTri12.x, thisTri12.y)];
      }
    }
    return [this];
  }

  toString(sigFigs: number = 4, sciNot?: boolean): string {
    if (sciNot) {
      return "M2[ (" + Helpers.sciNot(this.x0, sigFigs) + "," + Helpers.sciNot(this.y0, sigFigs)
      + ") ,(" + Helpers.sciNot(this.x1, sigFigs) + "," + Helpers.sciNot(this.y1, sigFigs) + ") ]";
    } else {
      const x0Pow: number = Math.floor(Math.log10(Math.abs(this.x0)));
      const x1Pow: number = Math.floor(Math.log10(Math.abs(this.x1)));
      const y0Pow: number = Math.floor(Math.log10(Math.abs(this.y0)));
      const y1Pow: number = Math.floor(Math.log10(Math.abs(this.y1)));
      return "M2[ (" + Helpers.roundToPow(this.x0, x0Pow - sigFigs + 1) + ","
      + Helpers.roundToPow(this.y0, y0Pow - sigFigs + 1) + "), ("
      + Helpers.roundToPow(this.x1, x1Pow - sigFigs + 1) + ","
      + Helpers.roundToPow(this.y1, y1Pow - sigFigs + 1) + ") ]";
    }
  } 
}