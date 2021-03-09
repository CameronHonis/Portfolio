import { M2 } from "./M2";
import { V2 } from "./V2";
import { V3 } from "./V3";

export class Tri {
  public p0: V2;
  public p1: V2;
  public p2: V2;

  constructor(p0: V2, p1: V2, p2: V2) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
  }

  pointInscribed(p: V2, inclusive: boolean = true): boolean {
    const sign = (p0: V2, p1: V2, p: V2): number => {
      return (p0.x - p.x) * (p1.y - p.y) - (p1.x - p.x) * (p0.y - p.y);
    }
    const d1: number = sign(p, this.p0, this.p1);
    const d2: number = sign(p, this.p1, this.p2);
    const d3: number = sign(p, this.p2, this.p0);
    let hasNeg: boolean, hasPos: boolean;
    if (inclusive) { 
      hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
      hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    } else { 
      hasNeg = (d1 <= 0) || (d2 <= 0) || (d3 <= 0); 
      hasPos = (d1 >= 0) || (d2 >= 0) || (d3 >= 0);
    }
    return !(hasNeg && hasPos);
  }

  negate(that: Tri): Tri[] {
    const this0inThat: boolean = that.pointInscribed(this.p0);
    const this1inThat: boolean = that.pointInscribed(this.p1);
    const this2inThat: boolean = that.pointInscribed(this.p2);
    if (this0inThat && this1inThat && this2inThat) { return []; }
    const that0inThis: boolean = this.pointInscribed(that.p0);
    const that1inThis: boolean = this.pointInscribed(that.p1);
    const that2inThis: boolean = this.pointInscribed(that.p2);
    const this01: M2 = new M2(this.p0, this.p1);
    const this02: M2 = new M2(this.p0, this.p2);
    const that01: M2 = new M2(that.p0, that.p1);
    const that02: M2 = new M2(that.p0, that.p2);
    const this12: M2 = new M2(this.p1, this.p2);
    const that12: M2 = new M2(that.p1, that.p2);
    const this01that01: V2 | null = this01.intersect(that01);
    const this01that02: V2 | null = this01.intersect(that02);
    const this02that01: V2 | null = this02.intersect(that01);
    const this02that02: V2 | null = this02.intersect(that02);
    const this12that01: V2 | null = this12.intersect(that01);
    const this12that02: V2 | null = this12.intersect(that02);
    const this12that12: V2 | null = this12.intersect(that12);
    const this02that12: V2 | null = this02.intersect(that12);
    const this01that12: V2 | null = this01.intersect(that12);
    if (!that0inThis && !that1inThis && !that2inThis && !this01that01 && !this01that02 && !this02that01 
    && !this02that02 && !this12that01 && !this12that02 && !this12that12 && !this01that12 && !this02that12) {
      return [this];
    }
    const vertices: [V2, M2[], V2?][] = []; //pos, avoidEdges, avoidVertex?
    const initializers: [number, number][] = []; //possible initial edges
    let idxsAdj: [number, number, number] = [-1,-1,-1];
    let idxsAdjPointer: number = 0;
    if (!this0inThat) { vertices.push([this.p0, [that01, that02, that12]]); idxsAdj[0] = 0; }
    if (!this1inThat) { 
      vertices.push([this.p1, [that01, that02, that12]]); 
      idxsAdj[1] = idxsAdj[idxsAdjPointer]+1;
      idxsAdjPointer++;
    }
    if (!this2inThat) { 
      vertices.push([this.p2, [that01, that02, that12]]); 
      idxsAdj[2] = idxsAdj[idxsAdjPointer]+1;
    }
    if (that0inThis) { vertices.push([that.p0, [that12]]); }
    if (that1inThis) { vertices.push([that.p1, [that02]]); }
    if (that2inThis) { vertices.push([that.p2, [that01]]); }
    if (this01that01) { 
      vertices.push([this01that01, [that02, that12], that.p2]);
      if (idxsAdj[0] >= 0) { initializers.push([vertices.length-1, idxsAdj[0]]); }
      if (idxsAdj[1] >= 0) { initializers.push([vertices.length-1, idxsAdj[1]]); }
    }
    if (this01that02) { 
      vertices.push([this01that02, [that01, that12], that.p1]); 
      if (idxsAdj[0] >= 0) { initializers.push([vertices.length-1, idxsAdj[0]]); }
      if (idxsAdj[1] >= 0) { initializers.push([vertices.length-1, idxsAdj[1]]); }
    }
    if (this01that12) { 
      vertices.push([this01that12, [that01, that02], that.p0]); 
      if (idxsAdj[0] >= 0) { initializers.push([vertices.length-1, idxsAdj[0]]); }
      if (idxsAdj[1] >= 0) { initializers.push([vertices.length-1, idxsAdj[1]]); }
    }
    if (this02that01) { 
      vertices.push([this02that01, [that02, that12], that.p2]); 
      if (idxsAdj[0] >= 0) { initializers.push([vertices.length-1, idxsAdj[0]]); }
      if (idxsAdj[2] >= 0) { initializers.push([vertices.length-1, idxsAdj[2]]); }
    }
    if (this02that02) { 
      vertices.push([this02that02, [that01, that12], that.p1]); 
      if (idxsAdj[0] >= 0) { initializers.push([vertices.length-1, idxsAdj[0]]); }
      if (idxsAdj[2] >= 0) { initializers.push([vertices.length-1, idxsAdj[2]]); } 
    }
    if (this02that12) { 
      vertices.push([this02that12, [that01, that02], that.p0,]); 
      if (idxsAdj[0] >= 0) { initializers.push([vertices.length-1, idxsAdj[0]]); }
      if (idxsAdj[2] >= 0) { initializers.push([vertices.length-1, idxsAdj[2]]); }
    }
    if (this12that01) { 
      vertices.push([this12that01, [that02, that12], that.p2]); 
      if (idxsAdj[1] >= 0) { initializers.push([vertices.length-1, idxsAdj[1]]); }
      if (idxsAdj[2] >= 0) { initializers.push([vertices.length-1, idxsAdj[2]]); }
    }
    if (this12that02) { 
      vertices.push([this12that02, [that01, that12], that.p1]); 
      if (idxsAdj[1] >= 0) { initializers.push([vertices.length-1, idxsAdj[1]]); }
      if (idxsAdj[2] >= 0) { initializers.push([vertices.length-1, idxsAdj[2]]); }
    }
    if (this12that12) { 
      vertices.push([this12that12, [that01, that02], that.p0]); 
      if (idxsAdj[1] >= 0) { initializers.push([vertices.length-1, idxsAdj[1]]); }
      if (idxsAdj[2] >= 0) { initializers.push([vertices.length-1, idxsAdj[2]]); }
    }
    const visited: Set<number> = new Set(); // helps prevent initializing on already visited vertex
    const triHash: {[index: string]: Tri} = {}; //index format: `${lowestIdx} ${secondLowestIdx} ${highestIdx}`
    const recursePolygon = (currs: [number, number], stops: [number,number] = [-1,-1], oppEdges?: [M2, M2]): number | undefined => {
      visited.add(currs[0]);
      visited.add(currs[1]);
      for (let i = 0; i < vertices.length; ++i) {
        if (i === currs[0] || i === currs[1]) { continue; }
        if (i === stops[0]) { continue; }
        if (vertices[currs[0]][1].length !== 3 && vertices[currs[1]][1].length !== 3 && vertices[i][1].length !== 3) {
          continue;
        }
        if (vertices[currs[0]][1].length === 3 && vertices[currs[1]][1].length === 3 && vertices[i][1].length === 3) {
          continue;
        }
        if (vertices[currs[0]][2] === vertices[i][0] || vertices[currs[1]][2] === vertices[i][0]) { continue; }
        // create tri hash
        let triIdx: string;
        if (currs[0] < currs[1] && currs[0] < i) {
          if (currs[1] < i) {
            triIdx = currs[0] + " " + currs[1] + " " + i;
          } else {
            triIdx = currs[0] + " " + i + " " + currs[1];
          }
        } else if (currs[1] < currs[0] && currs[1] < i) {
          if (currs[0] < i) {
            triIdx = currs[1] + " " + currs[0] + " " + i;
          } else {
            triIdx = currs[1] + i + " " + currs[0];
          }
        } else {
          if (currs[0] < currs[1]) {
            triIdx = i + " " + currs[0] + " " + currs[1];
          } else {
            triIdx = i + " " + currs[1] + " " + currs[0];
          }
        }
        if (triIdx in triHash) { continue; }
        // check oppEdge intersection
        const iP0: M2 = new M2(vertices[i][0], vertices[currs[0]][0]);
        const iP1: M2 = new M2(vertices[i][0], vertices[currs[1]][0]);
        const iMid: M2 = new M2(vertices[i][0], vertices[currs[0]][0].scale(.5).add(vertices[currs[1]][0].scale(.5)));
        if (oppEdges && iMid.intersect(oppEdges[0])) { continue; }
        if (oppEdges && iMid.intersect(oppEdges[1])) { continue; }
        // get all shared avoid lines
        const iP0Avoids: M2[] = [];
        const iP1Avoids: M2[] = [];
        const sharedAvoids: M2[] = [];
        for (const iAvoid of vertices[i][1]) {
          let inEdgeP0: boolean = false;
          for (const p0Avoid of vertices[currs[0]][1]) {
            if (iAvoid === p0Avoid) { inEdgeP0 = true; break; }
          }
          if (inEdgeP0) { iP0Avoids.push(iAvoid); }
          let inEdgeP1: boolean = false;
          for (const p1Avoid of vertices[currs[1]][1]) {
            if (iAvoid === p1Avoid) { inEdgeP1 = true; break; }
          }
          if (inEdgeP1) { iP1Avoids.push(iAvoid); }
          if (inEdgeP0 && inEdgeP1) { sharedAvoids.push(iAvoid); }
        }
        const iTri: Tri = new Tri(vertices[i][0], vertices[currs[0]][0], vertices[currs[1]][0]);
        // check for intersections at avoid lines
        let avoidIntersects: boolean = false;
        for (const iP0Avoid of iP0Avoids) {
          if (iP0.intersect(iP0Avoid)) {
            avoidIntersects = true;
            break;
          }
          if (iTri.pointInscribed(new V2(iP0Avoid.x0, iP0Avoid.y0), false)) {
            avoidIntersects = true;
            break;
          } 
          if (iTri.pointInscribed(new V2(iP0Avoid.x1, iP0Avoid.y1), false)) {
            avoidIntersects = true;
            break;
          }
        }
        for (const iP1Avoid of iP1Avoids) {
          if (iP1.intersect(iP1Avoid)) {
            avoidIntersects = true;
            break;
          }
          if (iTri.pointInscribed(new V2(iP1Avoid.x0, iP1Avoid.y0), false)) {
            avoidIntersects = true;
            break;
          }
          if (iTri.pointInscribed(new V2(iP1Avoid.x1, iP1Avoid.y1), false)) {
            avoidIntersects = true;
            break;
          }
        }
        if (avoidIntersects) { continue; }
        triHash[triIdx] = iTri;
        console.groupEnd();
        if (i === stops[1]) { return i; }
        const getCanExtrapolate = (idx0: number, idx1: number): boolean => {
          if (vertices[idx0][1].length === 1) {
            return vertices[idx1][1].length === 3;
          }
          if (vertices[idx0][1].length === 2) {
            return vertices[idx1][1].length === 2 || vertices[idx1][1].length === 3;
          }
          if (vertices[idx0][1].length === 3) {
            return vertices[idx1][1].length === 1 || vertices[idx1][1].length === 2;
          }
          return false;
        }
        if (getCanExtrapolate(currs[0], i)) {
          if (stops[0] < 0) {
            stops = [currs[0], i];
          }
          const stopped: number | undefined = recursePolygon([currs[0], i], stops, 
            [iP1, new M2(vertices[currs[0]][0], vertices[currs[1]][0])]);
          if (stopped) { return stopped; }
        }
        if (getCanExtrapolate(currs[1], i)) {
          if (stops[0] < 0) {
            stops = [currs[1], i];
          }
          const stopped: number | undefined = recursePolygon([currs[1], i], stops, 
            [iP0, new M2(vertices[currs[0]][0], vertices[currs[1]][0])]);
          if (stopped) { return stopped; }
        }
        break;
      }
    }
    for (const initializer of initializers) {
      if (!visited.has(initializer[0]) && !visited.has(initializer[1])) {
        const initEdge: M2 = new M2(vertices[initializer[0]][0], vertices[initializer[1]][0]);
        if (!initEdge.intersect(vertices[initializer[0]][1][0]) && !initEdge.intersect(vertices[initializer[0]][1][1])) {
          recursePolygon([initializer[0], initializer[1]]);
        }
      }
    }
    const rtnVals: Tri[] = Object.values(triHash);
    if (!rtnVals.length) {
      recursePolygon([0, 1]);

    }
    return Object.values(triHash);
  }

  boundingBox(): [V2, V2] {
    return [
      new V2(Math.min(this.p0.x, this.p1.x, this.p2.x), Math.min(this.p0.y, this.p1.y, this.p2.y)),
      new V2(Math.max(this.p0.x, this.p1.x, this.p2.x), Math.max(this.p0.y, this.p1.y, this.p2.y))
    ];
  }

  boundingBoxIntersects(that: Tri): boolean {
    const bb0: [V2,V2] = this.boundingBox();
    const bb1: [V2,V2] = that.boundingBox();
    const pointInBB = (bb: [V2,V2], p: V2) => {
      return bb[0].x < p.x && p.x < bb[1].x && bb[0].y < p.y && p.y < bb[1].y
    }
    return pointInBB(bb0, bb1[0]) || pointInBB(bb0, bb1[1]) || pointInBB(bb1, bb0[0]) || pointInBB(bb1, bb0[1]);
  }

  hashcode(): string {
    const order: [V2, V2, V2] = [this.p0, this.p1, this.p2];
    if (order[2].x < order[1].x || (order[2].x === order[1].x && order[2].y < order[1].y)) {
      const temp: V2 = order[1];
      order[1] = order[2];
      order[2] = temp;
    }
    if (order[1].x < order[0].x || (order[1].x === order[0].x && order[1].y < order[0].y)) {
      const temp: V2 = order[0];
      order[0] = order[1];
      order[1] = temp;
      // encapsulate in if block to save iteration if second swap doesnt occur
      if (order[2].x < order[1].x || (order[2].x === order[1].x && order[2].y < order[1].y)) {
        const temp: V2 = order[1];
        order[1] = order[2];
        order[2] = temp;
      }
    }
    return order[0].x + " " + order[0].y + " " + order[1].x + " " 
      + order[1].y + " " + order[2].x + " " + order[2].y;
  }
}