import { V2 } from "../models/V2";

export class Helpers {
  static sciNot(num: number, sigFigs: number = 4): string {
    sigFigs = Math.max(sigFigs, 1);
    const coeff: number = Math.pow(10, sigFigs-1);
    const pow10: number = Math.ceil(Math.log10(Math.abs(.1*num)));
    const rounded: number = Math.round(coeff*Math.pow(10, -pow10)*num)/coeff;
    return rounded + (pow10 ? "E" + pow10 : "");
  }

  // cuts number precision to 10^pow
  static roundToPow(num: number, pow: number = -3): string {
    const numStr: string = Math.abs(num).toString();
    let decimalIdx: number;
    if (num % 1 === 0) {
      decimalIdx = numStr.length;
    } else {
      decimalIdx = numStr.split(".")[0].length;
    }
    let rtn: string = numStr.slice(0, Math.max(0, decimalIdx - pow + (decimalIdx < numStr.length ? 1 : 0)));
    while (!rtn.length || (rtn.charAt(0) !== "0" && rtn.length < decimalIdx)) {
      rtn += "0";
    }
    return (Math.sign(num) === -1 ? "-" : "") + rtn;
  }

  static listTypes(arr: any): string {
    let rtn: string = "";
    for (let v of arr) {
      if (rtn.length) {
        rtn += ", ";
      }
      if (v) {
        rtn += v.constructor.name;
      } else if (v === null) {
        rtn += "null";
      } else {
        rtn += "undefined";
      }
    }
    return rtn;
  }

  //UNoptimized version of Math.atan2, returns range of (-pi, pi]
  static atan2(x: number, y: number): number
  static atan2(v2: V2): number
  static atan2(...args: any): number {
    let x: number, y: number;
    if (typeof args[0] === "number" && typeof args[1] === "number") {
      x = args[0];
      y = args[1];
    } else {
      x = args[0].x;
      y = args[0].y;
    }
    if (x === 0) {
      if (y > 0) {
        return 1.5708;
      } else {
        return -1.5708;
      }
    } else if (y === 0) {
      if (x > 0) {
        return 0;
      } else {
        return 3.1416;
      }
    }
    const q: number = y / x;
    let r: number;
    if (Math.abs(q) <= 1) {
      r = q*(1.0584 - Math.sign(q)*.273*q);
    } else {
      const invQ: number = 1/q;
      r = Math.sign(q)*1.5708 - invQ*(1.0584 - Math.sign(q)*.273*invQ);
    }
    if (x < 0) {
      r -= Math.sign(r)*3.1416;
    }
    return r;
  }

  static rad(deg: number): number { //converts degs to rads
    return deg/180*Math.PI;
  }

  // s0 - s6 provide algo with seed
  // assumes increment size of 1
  static perlinR2(x: number, y: number, seed?: number[]): number {
    if (!seed || seed.length !== 7) {
      seed = [2920, 21942, 171324, 8912, 23157, 21732, 9758];
    }
    const [ s0, s1, s2, s3, s4, s5, s6 ] = seed;
    const x0: number = Math.floor(x);
    const y0: number = Math.floor(y);
    // get seed generated gradient vectors for all 4 corners
    // gradients are unit vectors of length 1
    const getGrad = (x: number, y: number): V2 => {
      const gradAngle: number = s0 * Math.sin(s1*x + s2*y + s3) * Math.cos(s4*x + s5*y + s6);
      return new V2(Math.cos(gradAngle), Math.sin(gradAngle));
    }
    const dotGrad00: number = getGrad(x0, y0).dot(new V2(x0 - x, y0 - y));
    const dotGrad01: number = getGrad(x0+1, y0).dot(new V2(x0+1 - x, y0 - y));
    const dotGrad10: number = getGrad(x0, y0+1).dot(new V2(x0 - x, y0+1 - y));
    const dotGrad11: number = getGrad(x0+1, y0+1).dot(new V2(x0+1 - x, y0+1 - y));
    // interpolate dotGrads
    // w means "weight", numbers closer to 0 favors dg0, numbers closer to 1 favors dg1, must be in range [-1, 1]
    const interpDotGrads = (dg0: number, dg1: number, w: number): number => {
      return (dg1 - dg0) * (3 - 2*w)*w*w + dg0;
    }
    const topVal: number = interpDotGrads(dotGrad00, dotGrad01, x - x0);
    const botVal: number = interpDotGrads(dotGrad10, dotGrad11, x - x0);
    const final: number = interpDotGrads(topVal, botVal, y - y0);
    return final;
  }

  // clones object but keeps references to classes
  static deepCopy(obj: Object): Object {
    return this.deepCopyRecur(obj, {}, new Set());
  }

  private static deepCopyRecur(obj: Object, rtnObj: Object, objHistory: Set<Object>): Object {
    if (!obj || typeof obj !== "object") {
      return obj;
    }
    objHistory.add(obj);
    for (const [ key, val ] of Object.entries(obj)) {
      if (val === null || val.constructor.name !== "Object" || objHistory.has(val)) {
        rtnObj[key] = val;
      } else {
        rtnObj[key] = val instanceof Array ? [] : {};
        this.deepCopyRecur(val, rtnObj[key], objHistory);
      }
    }
    return rtnObj;
  }

  // fits index to array, prevents index overflows (i.e. input: idx = -1, arrSize = 3 --> output: 2)
  static fitIndex(idx: number, arrSize: number): number {
    return (idx + (idx < 0 ? -Math.floor(idx/arrSize) : 1)*arrSize) % arrSize;
  }

  static randomRange(low: number, high: number): number {
    return low + (high - low)*Math.random();
  }

  static clamp(num: number, low: number, high: number): number {
    return Math.max(low, Math.min(high, num));
  }
}