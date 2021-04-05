import { Helpers } from "../services/Helpers";
import { V2 } from "./V2";
import { V3 } from "./V3";

export class M4 {
  /*
  4x4 matrix
  Represents Transformation Matrix in R3 space of format:

  r00 r01 r02 p03
  r10 r11 r12 p13
  r20 r21 r22 p23
  0   0   0   1
  
  where: 
  <r00, r10, r20> === right normal vector
  <r01, r11, r21> === look normal vector
  <r02, r12, r22> === up normal vector
  <p03, p13, p23> === position
  */
  public r00: number;
  public r01: number;
  public r02: number;
  public r10: number;
  public r11: number;
  public r12: number;
  public r20: number;
  public r21: number;
  public r22: number;
  public p03: number;
  public p13: number;
  public p23: number;
  public rightVector: V3;
  public upVector: V3;
  public lookVector: V3;
  public position: V3;

  constructor()
  constructor(r00: number, r01: number, r02: number, p03: number, r10: number, r11: number, r12: number, 
  p13: number, r20: number, r21: number, r22: number, p23: number)
  constructor(rightVector: V3, lookVector: V3, upVector: V3, position: V3)
  constructor(position: V3, target: V3) // assumes 0 "roll", rightVector from <0,1,0> x lookVector
  constructor(...args: any){
    if (args.length === 0) {
      this.r00 = 1;
      this.r10 = 0;
      this.r20 = 0;
      this.r01 = 0;
      this.r11 = 1;
      this.r21 = 0;
      this.r02 = 0;
      this.r12 = 0;
      this.r22 = 1;
      this.p03 = 0;
      this.p13 = 0;
      this.p23 = 0;
    } else if (args.length === 12 && typeof args[0] === "number") {
      this.r00 = args[0];
      this.r10 = args[1];
      this.r20 = args[2];
      this.r01 = args[3];
      this.r11 = args[4];
      this.r21 = args[5];
      this.r02 = args[6];
      this.r12 = args[7];
      this.r22 = args[8];
      this.p03 = args[9];
      this.p13 = args[10];
      this.p23 = args[11];
    } else if (args.length === 4 && args[0] instanceof V3) {
      this.r00 = args[0].x;
      this.r10 = args[0].y;
      this.r20 = args[0].z;
      this.r01 = args[1].x;
      this.r11 = args[1].y;
      this.r21 = args[1].z;
      this.r02 = args[2].x;
      this.r12 = args[2].y;
      this.r22 = args[2].z;
      this.p03 = args[3].x;
      this.p13 = args[3].y;
      this.p23 = args[3].z;
    } else if (args.length === 2 && args[0] instanceof V3) {
      this.lookVector = args[1].add(args[0].scale(-1)).unit();
      if (this.lookVector.abs().equals(new V3(0, 0, 1))) {
        this.rightVector = new V3(1, 0, 0);
      } else {
        this.rightVector = this.lookVector.cross(new V3(0, 0, 1)).unit();
      }
      this.upVector = this.rightVector.cross(this.lookVector).unit();
      this.position = args[0];
      this.r00 = this.rightVector.x;
      this.r10 = this.rightVector.y;
      this.r20 = this.rightVector.z;
      this.r01 = this.lookVector.x;
      this.r11 = this.lookVector.y;
      this.r21 = this.lookVector.z;
      this.r02 = this.upVector.x;
      this.r12 = this.upVector.y;
      this.r22 = this.upVector.z;
      this.p03 = this.position.x;
      this.p13 = this.position.y;
      this.p23 = this.position.z;
    } else {
      throw new Error("Error constructing M4, unhandled parameter types: " + Helpers.listTypes(args));
    }
    this.rightVector = new V3(this.r00, this.r10, this.r20);
    this.lookVector = new V3(this.r01, this.r11, this.r21);
    this.upVector = new V3(this.r02, this.r12, this.r22);
    this.position = new V3(this.p03, this.p13, this.p23);
  }

  dot(that: V3): V3 {
    return new V3(
      this.r00*that.x + this.r01*that.y + this.r02*that.z + this.p03,
      this.r10*that.x + this.r11*that.y + this.r12*that.z + this.p13,
      this.r20*that.x + this.r21*that.y + this.r22*that.z + this.p23
    );
  }

  product(that: M4): M4 {
    return new M4(
      this.r00*that.r00 + this.r01*that.r10 + this.r02*that.r20,
      this.r10*that.r00 + this.r11*that.r10 + this.r12*that.r20,
      this.r20*that.r00 + this.r21*that.r10 + this.r22*that.r20,
      this.r00*that.r01 + this.r01*that.r11 + this.r02*that.r21,
      this.r10*that.r01 + this.r11*that.r11 + this.r12*that.r21,
      this.r20*that.r01 + this.r21*that.r11 + this.r22*that.r21,
      this.r00*that.r02 + this.r01*that.r12 + this.r02*that.r22,
      this.r10*that.r02 + this.r11*that.r12 + this.r12*that.r22,
      this.r20*that.r02 + this.r21*that.r12 + this.r22*that.r22,
      this.r00*that.p03 + this.r01*that.p13 + this.r02*that.p23 + this.p03,
      this.r10*that.p03 + this.r11*that.p13 + this.r12*that.p23 + this.p13,
      this.r20*that.p03 + this.r21*that.p13 + this.r22*that.p23 + this.p23
    );
  }

  invert(): M4 {
    return new M4(
      this.r11*this.r22 - this.r21*this.r12, //r00
      -this.r10*this.r22 + this.r20*this.r12, //r10
      this.r10*this.r21 - this.r20*this.r11, //r20
      -this.r01*this.r22 + this.r21*this.r02, //r01
      this.r00*this.r22 - this.r20*this.r02, //r11
      -this.r00*this.r21 + this.r20*this.r01, //r21
      this.r01*this.r12 - this.r11*this.r02, //r02
      -this.r00*this.r12 + this.r10*this.r02, //r12
      this.r00*this.r11 - this.r10*this.r01, //r22
      -this.r01*this.r12*this.p23 + this.r01*this.p13*this.r22 
        + this.r11*this.r02*this.p23 - this.r11*this.p03*this.r22 
        - this.r21*this.r02*this.p13 + this.r21*this.p03*this.r12, //p03
      this.r00*this.r12*this.p23 - this.r00*this.p13*this.r22 
        - this.r10*this.r02*this.p23 + this.r10*this.p03*this.r22 
        + this.r20*this.r02*this.p13 - this.r20*this.p03*this.r12, //p13
      -this.r00*this.r11*this.p23 + this.r00*this.p13*this.r21 
        + this.r10*this.r01*this.p23 - this.r10*this.p03*this.r21 
        - this.r20*this.r01*this.p13 + this.r20*this.p03*this.r11, //p23
    );
  }

  pointToScreenPos(point: V3, FOV: V2, screenSize: V2): V2 {
    let relPos: V3 = this.invert().dot(point);
    if (relPos.y < 0.01) {
      return new V2(NaN, NaN);
    }
    const unmappedX: number = relPos.x/relPos.y/Math.tan(FOV.x/2);
    const unmappedY: number = relPos.z/relPos.y/Math.tan(FOV.y/2);
    const mappedX: number = (.5 + unmappedX/2)*screenSize.x;
    const mappedY: number = (.5 - unmappedY/2)*screenSize.y;
    return new V2(
      mappedX, 
      mappedY
    );
  }

  rotateZXY(z: number, x: number, y: number): M4 {
    const thisRotZ: M4 = this.product(new M4(new V3(0,0,0), new V3(Math.sin(z), Math.cos(z), 0)));
    const thisRotZX: M4 = thisRotZ.product(new M4(new V3(0,0,0), new V3(0, Math.cos(x), Math.sin(x))));
    return thisRotZX.product(new M4(
      new V3(Math.cos(y), 0, Math.sin(y)), 
      new V3(0,1,0), 
      new V3(Math.cos(y + Math.PI/2), 0, Math.sin(y + Math.PI/2)), 
      new V3(0,0,0)
    ));
  }

  center(): M4 {
    return new M4(this.rightVector, this.lookVector, this.upVector, new V3(0,0,0));
  }

  getViewportBoundingBox(FOV: V2, renderDis: number, angularRelief: number = Math.PI/16): [V3, V3] { // gets bounding box of render space
    FOV = FOV.add(angularRelief, angularRelief);
    let viewBB: [V3, V3] = [this.position, this.position];
    const updateBB = (newPos: V3): void => {
      viewBB[0] = new V3(Math.min(viewBB[0].x, newPos.x), Math.min(viewBB[0].y, newPos.y), Math.min(viewBB[0].z, newPos.z));
      viewBB[1] = new V3(Math.max(viewBB[1].x, newPos.x), Math.max(viewBB[1].y, newPos.y), Math.max(viewBB[1].z, newPos.z));
    }
    // get corner viewport box positions
    const topLeftRay: V3 = this.rotateZXY(-FOV.x/2, FOV.y/2, 0).dot(new V3(0, renderDis, 0));
    updateBB(topLeftRay);
    const topRightRay: V3 = this.rotateZXY(FOV.x/2, FOV.y/2, 0).dot(new V3(0, renderDis, 0));
    updateBB(topRightRay);
    const botLeftRay: V3 = this.rotateZXY(-FOV.x/2, -FOV.y/2, 0).dot(new V3(0, renderDis, 0));
    updateBB(botLeftRay);
    const botRightRay: V3 = this.rotateZXY(FOV.x/2, -FOV.y/2, 0).dot(new V3(0, renderDis, 0));
    updateBB(botRightRay);
    // include spherical edge of render area
    const checkAxisRay = (axisRay: V3): void => {
      if (this.center().isInFrame(axisRay, FOV)) {
        const axisRayPos: V3 = this.position.add(axisRay.unit().scale(renderDis));
        updateBB(axisRayPos);
      }
    }
    checkAxisRay(new V3(1,0,0));
    checkAxisRay(new V3(-1,0,0));
    checkAxisRay(new V3(0,1,0));
    checkAxisRay(new V3(0,-1,0));
    checkAxisRay(new V3(0,0,1));
    checkAxisRay(new V3(0,0,-1));
    return viewBB;
  }

  isInFrame(point: V3, FOV: V2): boolean { // only works for FOVs < 180 degs
    const relPoint: V3 = this.invert().dot(point).unit();
    return relPoint.y > 0 && Math.abs(relPoint.x) < Math.sin(FOV.x/2) && Math.abs(relPoint.z) < Math.sin(FOV.y/2);
  }

  toString(expandedForm: boolean = false, sigFigs: number = 4): string {
    if (!expandedForm) {
      return "M4[ r" + this.rightVector.toString(sigFigs) 
        + "\n    l" + this.lookVector.toString(sigFigs) + " " 
        + "\n    u" + this.upVector.toString(sigFigs) 
        + "\n    p" + this.position.toString(sigFigs) + "]";
    } else {
      const r00pow: number = Math.floor(Math.log10(Math.abs(this.r00)));
      const r01pow: number = Math.floor(Math.log10(Math.abs(this.r01)));
      const r02pow: number = Math.floor(Math.log10(Math.abs(this.r02)));
      const p03pow: number = Math.floor(Math.log10(Math.abs(this.p03)));
      const r10pow: number = Math.floor(Math.log10(Math.abs(this.r10)));
      const r11pow: number = Math.floor(Math.log10(Math.abs(this.r11)));
      const r12pow: number = Math.floor(Math.log10(Math.abs(this.r12)));
      const p13pow: number = Math.floor(Math.log10(Math.abs(this.p13)));
      const r20pow: number = Math.floor(Math.log10(Math.abs(this.r20)));
      const r21pow: number = Math.floor(Math.log10(Math.abs(this.r21)));
      const r22pow: number = Math.floor(Math.log10(Math.abs(this.r22)));
      const p23pow: number = Math.floor(Math.log10(Math.abs(this.p23)));
      return "[" + Helpers.roundToPow(this.r00, r00pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.r01, r01pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.r02, r02pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.p03, p03pow - sigFigs + 1) + ",\n "
        + Helpers.roundToPow(this.r10, r10pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.r11, r11pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.r12, r12pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.p13, p13pow - sigFigs + 1) + ",\n "
        + Helpers.roundToPow(this.r20, r20pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.r21, r21pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.r22, r22pow - sigFigs + 1) + ", "
        + Helpers.roundToPow(this.p23, p23pow - sigFigs + 1) + ",\n "
        + "0, 0, 0, 1]";
    }
  }
}