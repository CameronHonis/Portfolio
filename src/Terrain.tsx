import React from "react";
import { M4 } from "./models/M4";
import { V2 } from "./models/V2";
import { V3 } from "./models/V3";
import { Helpers } from "./models/Helpers";
import { Tri } from "./models/Tri";
import { M2 } from "./models/M2";
import { isJsxAttribute } from "typescript";

const terrainWidth: number = 170;
const tileWidth: number = 8;
const tileHeight: number = 10;
const camSpeed: number = 20;
const screenSize: V2 = new V2(window.innerWidth, window.innerHeight - .114*window.innerWidth);
const camDirection: V3 = new V3(0, 1, -.05);
const renderDis: number = 220;
const perlinWeights: number[] = [.42, .08];
const perlinFreqs: number[] = [.05, .7];
const perlinMax: number = 40;
const canyonDropoff: number = .12;
const canyonMax: number = 15;
const defaultHeight: number = 0;
const xFOV: number = Helpers.rad(70);
const fogStart: number = 0;
const fogEnd: number = 210;
const fogMax: number = 1;
const maxDotSize: number = .3;
const triColorDark: V3 = new V3(0, 0, 0);
const triColorLight: V3 = new V3(20, 20, 80);
const triMaxOpacity: number = .7;
const debugging: boolean = true;

export interface Refs {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  terrainPoints: {
    [index: string]: V3; // index format: xPos + " " + zPos
  };
  terrainDespawnWatch: {[index: string]: number} // string=vertex hash, value=time in despawnWatch
  camera: M4;
  cameraFOV: V2;
  t: number;
  paused: boolean;
  perlinSeed: number[]
  fpsRA: number;
  framesCount: number;
}

export const initRefs: Refs = {
  canvas: React.createRef() as React.MutableRefObject<HTMLCanvasElement>,
  terrainPoints: {},
  terrainDespawnWatch: {},
  camera: new M4(new V3(0,0,0), camDirection),
  cameraFOV: new V2(xFOV, xFOV*Math.min(1.2, .8*window.innerHeight/window.innerWidth)),
  t: 0,
  paused: true,
  perlinSeed: [],
  fpsRA: 0,
  framesCount: 0,
}

export const Terrain: React.FC = () => {
  let { current: refs } = React.useRef<Refs>(initRefs);

  React.useEffect(() => {
    document.addEventListener("resize", () => {
      refs.cameraFOV = new V2(xFOV, xFOV*Math.min(1.2, window.innerHeight/window.innerWidth));
    });
    if (debugging) {
      document.addEventListener("keydown", (e) => {
        console.log(e.key.toLowerCase());
        if (e.key.toLowerCase() === " ") {
          refs.paused = !refs.paused;
        } else if (e.key.toLowerCase() === "arrowup") {
          refs.camera = refs.camera.product(new M4(new V3(0,0,0), new V3(0,.99985,.0175)));
        } else if (e.key.toLowerCase() === "arrowdown") {
          refs.camera = refs.camera.product(new M4(new V3(0,0,0), new V3(0,.99985,-.0175)));
        } else if (e.key.toLowerCase() === "arrowright") {
          refs.camera = refs.camera.product(new M4(new V3(0,0,0), new V3(.0175,.99985,0)));
        } else if (e.key.toLowerCase() === "arrowleft") {
          refs.camera = refs.camera.product(new M4(new V3(0,0,0), new V3(-.0175,.99985,0)));
        }
      });
    }
    for (let i = 0; i < 7; ++i) {
      refs.perlinSeed.push(Math.random()*30000);
    }
    const terrainClock = (t1: number) => {
      refs.framesCount++;
      const t: number = window.performance.now();
      if (debugging) {
        const debug3: HTMLParagraphElement | null = document.querySelector("#debug3");
        if (debug3) {
          refs.fpsRA = refs.fpsRA*(Math.min(refs.framesCount, 10)-1)/Math.min(refs.framesCount,10) + 1000/(t-t1)/Math.min(refs.framesCount,10);
          debug3.textContent = "FPS: " + Helpers.roundToPow(refs.fpsRA, -1);
        }
      }
      render((t - t1)/1000);
      setTimeout(() => {
        terrainClock(t);
      },0);
    }; terrainClock(window.performance.now());
    render(0);
  },[]); //eslint-disable-line

  const render = (dt: number) => {
    //render viewport bounding box
    const viewBB: [V3, V3] = refs.camera.getViewportBoundingBox(refs.cameraFOV, renderDis); //TODO: look into why z-axis bb was bigger than x for FOV of <pi/2, pi/4>
    // console.log(refs.camera.position.toString(), viewBB[0].toString(), viewBB[1].toString());
    const spawnDespawn = (): void => { //eslint-disable-line
      const xTileRange: [number, number] = [
        tileWidth*Math.floor(viewBB[0].x/tileWidth), 
        tileWidth*Math.ceil(viewBB[1].x/tileWidth)
      ];
      const yTileRange: [number, number] = [
        tileHeight*Math.floor(viewBB[0].y/tileHeight),
        tileHeight*Math.floor(viewBB[1].y/tileHeight)
      ];
      for (let x = xTileRange[0]; x <= xTileRange[1]; x += tileWidth) {
        for (let y = yTileRange[0]; y <= yTileRange[1]; y += tileHeight) {
          if (Math.abs(x) > terrainWidth/2) { continue; }
          if (!(x + " " + y in refs.terrainPoints)) {
            const perlinHeight: number = perlinMax*(perlinWeights[0]*Helpers.perlinR2(perlinFreqs[0]*x, perlinFreqs[0]*y, refs.perlinSeed) 
              + perlinWeights[1]*Helpers.perlinR2(perlinFreqs[1]*x, perlinFreqs[1]*y, refs.perlinSeed) - .5);
            const canyonHeight: number = canyonMax*(1 - 1/(1+Math.pow(Math.E, Math.abs(canyonDropoff*x) - 4)));
            refs.terrainPoints[x + " " + y] = new V3(x, y, perlinHeight + canyonHeight - defaultHeight);
            //refs.terrainPoints[x + " " + y] = new V3(x, y, -defaultHeight); //flat terrain
          }
        }
      }
      //despawn
      for (const vHash of Object.keys(refs.terrainDespawnWatch)) {
        refs.terrainDespawnWatch[vHash] += dt;
        if (refs.terrainDespawnWatch[vHash] > 3) {
          delete refs.terrainPoints[vHash];
          delete refs.terrainDespawnWatch[vHash];
        }
      }
    }; spawnDespawn();
    // refs.terrainPoints["0 10"] = new V3(0, 10, -1);
    // refs.terrainPoints["0 20"] = new V3(0, 20, 2);
    // refs.terrainPoints["8 20"] = new V3(8, 20, 2);

    // refs.terrainPoints["8 10"] = new V3(8, 10, -3);
    // refs.terrainPoints["8 20"] = new V3(8, 20, 0);
    // refs.terrainPoints["16 20"] = new V3(16, 20, 0);

    // refs.terrainPoints["0 80"] = new V3(0, 80, -5);
    // refs.terrainPoints["0 90"] = new V3(0, 90, -3);
    // refs.terrainPoints["8 90"] = new V3(8, 90, 0);
    // refs.terrainPoints["8 80"] = new V3(8, 80, -5);
    // refs.terrainPoints["16 80"] = new V3(16, 80, -5);
    // refs.terrainPoints["16 90"] = new V3(16, 90, -3);
    if (!refs.paused) {
      const incrementPhys = (): void => {
        refs.t += .01
        refs.camera = new M4(
          refs.camera.position.add(new V3(0, dt*camSpeed, 0)), 
          refs.camera.position.add(new V3(0, dt*camSpeed, 0).add(camDirection))
        );
      }; incrementPhys();
    }
    let vertexCount: number = 0;
    let lineCount: number = 0;
    let triCount: number = 0;
    const setCanvas = (): void => {
      const canv: HTMLCanvasElement = refs.canvas.current;
      const ctx: CanvasRenderingContext2D | null = refs.canvas.current.getContext("2d");
      const anchorLength: number = Math.max(window.innerWidth, window.innerHeight);
      if (!ctx) { return; }
      ctx.clearRect(0, 0, canv.width,canv.height);
      const dpr: number = window.devicePixelRatio;
      const styledWidth: number = +getComputedStyle(canv).getPropertyValue("width").slice(0,-2);
      const styledHeight: number = +getComputedStyle(canv).getPropertyValue("height").slice(0,-2);
      canv.setAttribute("width", styledWidth*dpr + "px");
      canv.setAttribute("height", styledHeight*dpr + "px");

      const drawTri = (tri: Tri, triDiss: V3, faceColor: V3, vertexHashes: [string, string, string]): void => { //eslint-disable-line
        if (isNaN(tri.p0.x) || isNaN(tri.p0.y)) { return; }
        if (isNaN(tri.p1.x) || isNaN(tri.p1.y)) { return; }
        if (isNaN(tri.p2.x) || isNaN(tri.p2.y)) { return; }
        delete refs.terrainDespawnWatch[vertexHashes[0]];
        delete refs.terrainDespawnWatch[vertexHashes[1]];
        delete refs.terrainDespawnWatch[vertexHashes[2]];
        let closest: [V2,number], furthest: [V2,number];
        if (triDiss.x < triDiss.y && triDiss.x < triDiss.z) {
          closest = [tri.p0, triDiss.x];
          if (triDiss.y < triDiss.z) {
            furthest = [tri.p2, triDiss.z];
          } else {
            furthest = [tri.p1, triDiss.y];
          }
        } else if (triDiss.y < triDiss.x && triDiss.y < triDiss.z) {
          closest = [tri.p1, triDiss.y];
          if (triDiss.x < triDiss.z) {
            furthest = [tri.p2, triDiss.z];
          } else {
            furthest = [tri.p1, triDiss.y];
          }
        } else {
          closest = [tri.p2, triDiss.z];
          if (triDiss.x < triDiss.y) {
            furthest = [tri.p1, triDiss.y];
          } else {
            furthest = [tri.p0, triDiss.x];
          }
        }
        const grad: CanvasGradient = ctx.createLinearGradient(closest[0].x, closest[0].y, furthest[0].x, furthest[0].y);
        const opacityClose: number = triMaxOpacity*Math.max(1 - fogMax, Math.min(1, 
          (fogEnd - fogStart*(1 - fogMax))/(fogEnd - fogStart) - fogMax*closest[1]/fogEnd));
        const opacityFar: number = triMaxOpacity*Math.max(1 - fogMax, Math.min(1, 
          (fogEnd - fogStart*(1 - fogMax))/(fogEnd - fogStart) - fogMax*furthest[1]/fogEnd));
        const closeColor: V3 = vertexColor(faceColor, opacityClose, closest[0]);
        const farColor: V3 = vertexColor(faceColor, opacityFar, furthest[0]);
        grad.addColorStop(0, "rgb(" + closeColor.x + "," + closeColor.y + "," + closeColor.z + ")");
        grad.addColorStop(1, "rgb(" + farColor.x + "," + farColor.y + "," + farColor.z + ")");
        ctx.beginPath();
        ctx.moveTo(tri.p0.x, tri.p0.y);
        ctx.lineTo(tri.p1.x, tri.p1.y);
        ctx.lineTo(tri.p2.x, tri.p2.y);
        ctx.fillStyle = grad;
        ctx.fill();
        triCount++;
      }
      const drawVertex = (screenPos: V2, dis: number) => { //eslint-disable-line
        //if (isNaN(screenPos.x) || isNaN(screenPos.y)) { return; }
        const opacity: number = Math.max(1 - fogMax, Math.min(1, 
          (fogEnd - fogStart*(1 - fogMax))/(fogEnd - fogStart) - fogMax*dis/fogEnd));
        const color: V3 = vertexColor(new V3(50,255,255), opacity, screenPos);
        ctx.beginPath();
        ctx.arc(
          screenPos.x,
          screenPos.y,
          anchorLength*maxDotSize/dis,
          0,
          2*Math.PI
        );
        ctx.fillStyle = "rgb(" + color.x + "," + color.y + "," + color.z + ")";
        ctx.fill();
        vertexCount++;
      }
      const drawLine = (line: M2, minDis: number, maxDis: number): void => { //eslint-disable-line
        if (isNaN(line.x0) || isNaN(line.y0)) { return; }
        if (isNaN(line.x1) || isNaN(line.y1)) { return; }
        const opacity0: number = Math.max(1 - fogMax, Math.min(1,
          (fogEnd - fogStart*(1 - fogMax))/(fogEnd - fogStart) - fogMax*minDis/fogEnd));
        const opacity1: number = Math.max(1 - fogMax, Math.min(1, 
          (fogEnd - fogStart*(1 - fogMax))/(fogEnd - fogStart) - fogMax*maxDis/fogEnd));
        const screenPos0: V2 = new V2(line.x0, line.y0);
        const screenPos1: V2 = new V2(line.x1, line.y1);
        const grad: CanvasGradient = ctx.createLinearGradient(line.x0, line.y0, line.x1, line.y1);
        const color: V3 = vertexColor(new V3(50,255,255), opacity0, screenPos0);
        const color2: V3 = vertexColor(new V3(50,255,255), opacity1, screenPos1);
        grad.addColorStop(0, "rgb(" + color.x + "," + color.y + "," + color.z + ")");
        grad.addColorStop(1, "rgb(" + color2.x + "," + color2.y + "," + color2.z + ")");
        ctx.beginPath();
        ctx.moveTo(line.x0, line.y0);
        ctx.lineTo(line.x1, line.y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth = anchorLength*maxDotSize/(.5*minDis + .5*maxDis);
        ctx.stroke();
        lineCount++;
        ctx.closePath();
      }
      const screenPoss: {[index: string]: V2} = {};
      // 1st idx undefined if inserted then overlapped; 1=screenPoss, 2=diss, 3=colors, 4=vertexHashes
      const sortedTris: [Tri, V3, V3, [string, string, string]][] = [];
      for (const [ tpHash, tp] of Object.entries(refs.terrainPoints)) { // adds tris sorted by lowest to highest cam dis
        if (!(tpHash in refs.terrainDespawnWatch)) { refs.terrainDespawnWatch[tpHash] = 0; }
        const dpHash: string = (tp.x + tileWidth) + " " + (tp.y + tileHeight);
        if (!(dpHash in refs.terrainPoints)) { continue; }
        const camTp: V3 = tp.add(refs.camera.position.scale(-1));
        const dp: V3 = refs.terrainPoints[dpHash];
        const rpHash: string = (tp.x + tileWidth) + " " + tp.y;
        const upHash: string = tp.x + " " + (tp.y + tileHeight);
        const triOnScreen = (tri: Tri): boolean => {
          if (tri.p0.x > 0 && tri.p0.x < screenSize.x && tri.p0.y > 0 && tri.p0.y < screenSize.y) {
            return true;
          } else if (tri.p1.x > 0 && tri.p1.x < screenSize.x && tri.p1.y > 0 && tri.p1.y < screenSize.y) {
            return true;
          } else if (tri.p2.x > 0 && tri.p2.x < screenSize.x && tri.p2.y > 0 && tri.p2.y < screenSize.y) {
            return true;
          } else if (Math.abs(tri.p0.x) < screenSize.x*5 && Math.abs(tri.p0.y) < screenSize.y*5 && Math.abs(tri.p1.x) < screenSize.x*5
          && Math.abs(tri.p1.y) < screenSize.y*5 && Math.abs(tri.p2.x) < screenSize.x*5 && Math.abs(tri.p2.y) < screenSize.y*5) {
            const topLine: M2 = new M2(new V2(0,0), new V2(0, screenSize.x));
            const botLine: M2 = new M2(new V2(0,screenSize.y), new V2(screenSize.x, screenSize.y));
            const leftLine: M2 = new M2(new V2(0,0), new V2(0,screenSize.y));
            const rightLine: M2 = new M2(new V2(screenSize.x,0), new V2(screenSize.x,screenSize.y));
            const tri01: M2 = new M2(tri.p0, tri.p1);
            const tri02: M2 = new M2(tri.p0, tri.p2);
            const tri12: M2 = new M2(tri.p1, tri.p2);
            if (topLine.intersect(tri01) || topLine.intersect(tri02) || topLine.intersect(tri12)) {
              return true;
            } else if (botLine.intersect(tri01) || botLine.intersect(tri02) || botLine.intersect(tri12)) {
              return true;
            } else if (leftLine.intersect(tri01) || leftLine.intersect(tri02) || leftLine.intersect(tri12)) {
              return true;
            } else if (rightLine.intersect(tri01) || rightLine.intersect(tri02) || rightLine.intersect(tri12)) {
              return true;
            }
          }
          
          return false;
        }
        const insertTri = (p2: V3, p2Hash: string, tri: Tri, triNormal: V3) => {
          if (!triOnScreen(tri)) { 
            return; 
          }
          const diss: V3 = new V3(camTp.mag(), dp.add(refs.camera.position.scale(-1)).mag(), p2.add(refs.camera.position.scale(-1)).mag());
          const minDis: number = Math.min(diss.x, diss.y, diss.z);
          const reflNormal: V3 = camTp.add(triNormal.scale(-2*camTp.dot(triNormal))).unit();
          const reflDot: number = reflNormal.dot(new V3(.3826, .3535, .8535));
          const refl: number = Math.pow(reflDot, 10) + .05*reflDot;
          const baseFaceColor: V3 = triColorDark.add(triColorLight.add(triColorDark.scale(-1)).scale(refl));
          let lower: number = 0; // also insert idx
          let upper: number = sortedTris.length-1;
          while (lower <= upper) {
            const mid: number = Math.floor((upper + lower)/2);
            const midDis: number = Math.min(sortedTris[mid][1].x, sortedTris[mid][1].y, sortedTris[mid][1].z);
            if (minDis === midDis) {
              lower = mid;
              break;
            } else if (minDis < midDis) {
              upper = mid - 1;
            } else if (minDis > midDis) {
              lower = mid + 1;
            }
          }
          if (lower === sortedTris.length) {
            sortedTris.push([tri, diss, baseFaceColor, [tpHash, dpHash, p2Hash]]);
          } else {
            sortedTris.splice(lower, 0, [tri, diss, baseFaceColor, [tpHash, dpHash, p2Hash]]);
          }
        }
        if (rpHash in refs.terrainPoints) {
          const rp: V3 = refs.terrainPoints[rpHash];
          const triNormal: V3 = tp.add(rp.scale(-1)).cross(tp.add(dp.scale(-1)));
          if (triNormal.dot(camTp) < 0) {
            if (!(tpHash in screenPoss)) {
              screenPoss[tpHash] = refs.camera.pointToScreenPos(tp, refs.cameraFOV, screenSize);
            }
            if (!(dpHash in screenPoss)) {
              screenPoss[dpHash] = refs.camera.pointToScreenPos(dp, refs.cameraFOV, screenSize);
            }
            if (!(rpHash in screenPoss)) {
              screenPoss[rpHash] = refs.camera.pointToScreenPos(rp, refs.cameraFOV, screenSize);
            }
            insertTri(rp, rpHash, new Tri(screenPoss[tpHash], screenPoss[dpHash], screenPoss[rpHash]), triNormal);
          }
        }
        if (upHash in refs.terrainPoints) {
          const up: V3 = refs.terrainPoints[upHash];
          const triNormal: V3 = tp.add(dp.scale(-1)).cross(tp.add(up.scale(-1)));
          if (triNormal.dot(camTp) < 0) {
            if (!(tpHash in screenPoss)) {
              screenPoss[tpHash] = refs.camera.pointToScreenPos(tp, refs.cameraFOV, screenSize);
            }
            if (!(dpHash in screenPoss)) {
              screenPoss[dpHash] = refs.camera.pointToScreenPos(dp, refs.cameraFOV, screenSize);
            }
            if (!(upHash in screenPoss)) {
              screenPoss[upHash] = refs.camera.pointToScreenPos(up, refs.cameraFOV, screenSize);
            }
            insertTri(up, upHash, new Tri(screenPoss[tpHash], screenPoss[dpHash], screenPoss[upHash]), triNormal);
          }
        }
      }
      const vertsToDraw: [V2,number][] = [];
      const linesToDraw: [M2,number,number][] = [];
      for (let i = sortedTris.length-1; i >= 0; --i) {
        const iTri: Tri = sortedTris[i][0];
        let overlapped: boolean = false;
        const iVerts: [boolean,boolean,boolean] = [true,true,true];
        let iLines: [M2,number,number][] = [];
        const maxDotR: number = anchorLength*maxDotSize;
        const i0DotR: number = maxDotR/sortedTris[i][1].x;
        const i1DotR: number = maxDotR/sortedTris[i][1].y;
        const i2DotR: number = maxDotR/sortedTris[i][1].z;
        const i01Start: V2 = iTri.p0.add(iTri.p1.add(iTri.p0.scale(-1)).unit().scale(i0DotR));
        const i01End: V2 = iTri.p1.add(iTri.p0.add(iTri.p1.scale(-1)).unit().scale(i1DotR));
        const i02Start: V2 = iTri.p0.add(iTri.p2.add(iTri.p0.scale(-1)).unit().scale(i0DotR));
        const i02End: V2 = iTri.p2.add(iTri.p0.add(iTri.p2.scale(-1)).unit().scale(i2DotR));
        const i12Start: V2 = iTri.p1.add(iTri.p2.add(iTri.p1.scale(-1)).unit().scale(i1DotR));
        const i12End: V2 = iTri.p2.add(iTri.p1.add(iTri.p2.scale(-1)).unit().scale(i2DotR));
        iLines.push([new M2(i01Start, i01End), sortedTris[i][1].x, sortedTris[i][1].y]); //these could possibly have dis <= 0
        iLines.push([new M2(i02Start, i02End), sortedTris[i][1].x, sortedTris[i][1].z]);
        iLines.push([new M2(i12Start, i12End), sortedTris[i][1].y, sortedTris[i][1].z]);
        for (let j = i-1; j >= 0; --j) {
          const jTri: Tri = sortedTris[j][0];
          const iP0Inscribed: boolean = jTri.pointInscribed(iTri.p0);
          const iP1Inscribed: boolean = jTri.pointInscribed(iTri.p1);
          const iP2Inscribed: boolean = jTri.pointInscribed(iTri.p2);
          if (iP0Inscribed) { iVerts[0] = false; }
          if (iP1Inscribed) { iVerts[1] = false; }
          if (iP2Inscribed) { iVerts[2] = false; }
          if (iP0Inscribed && iP1Inscribed && iP2Inscribed) {
            overlapped = true;
            break;
          }
          const iNextLines: [M2,number,number][] = [];
          for (const iLine of iLines) {
            const dDis: number = iLine[2] - iLine[1];
            const dX: number = iLine[0].x1 - iLine[0].x0;
            const dY: number = iLine[0].y1 - iLine[0].y0;
            iLine[0].negateFromTri(jTri).forEach(v => {
              if (v.x0 !== v.x1 || v.y0 !== v.y1) {
                let dis0: number, dis1: number;
                if (dX) {
                  dis0 = (v.x0 - iLine[0].x1)/dX * dDis + iLine[2];
                  dis1= (v.x1 - iLine[0].x0)/dX * dDis + iLine[1];
                } else {
                  dis0 = (v.y0 - iLine[0].y1)/dY * dDis + iLine[2];
                  dis1 = (v.y1 - iLine[0].y0)/dY * dDis + iLine[1];
                }
                if (isNaN(dis0) || isNaN(dis1)) {
                  console.log(iLine, jTri);
                  throw new Error();
                }
                iNextLines.push([v, dis0, dis1]);
              }
            });
          }
          iLines = iNextLines;
        }
        if (!overlapped) { 
          //drawTri(...sortedTris[i]);
          if (iVerts[0]) { vertsToDraw.push([iTri.p0, sortedTris[i][1].x]); }
          if (iVerts[1]) { vertsToDraw.push([iTri.p1, sortedTris[i][1].y]); }
          if (iVerts[2]) { vertsToDraw.push([iTri.p2, sortedTris[i][1].z]); }
          for (const iLine of iLines) {
            linesToDraw.push(iLine);
          }
        }
      }
      for (const vertToDraw of vertsToDraw) {
        //drawVertex(...vertToDraw);
      }
      for (const lineToDraw of linesToDraw) {
        //drawLine(...lineToDraw);
      }
    }; setCanvas();
    
    // if (sortedPoints.length !== Object.values(refs.terrainPoints).length) { // ensures all terrainPoints are being sorted
    //   throw new Error();
    // }
    // for (let i = sortedPoints.length-1; i >= 0; --i) { // paints terrain by sorted terrainPoints
    //   const [point, dis]: [V3, number] = sortedPoints[i];
    //   const screenPos: V2 = refs.camera.pointToScreenPos(point, refs.cameraFOV, screenSize);
    //   if (isNaN(screenPos.x) || isNaN(screenPos.y)) {
    //     refs.terrainDespawnWatch.add(point.x + " " + point.y);
    //     continue;
    //   }
    //   const xyPos: V2 = new V2(point.x, point.y);
    //   if (screenPos.x > window.innerWidth/2
    //   && (xyPos.x + tileWidth) + " " + (xyPos.y + tileHeight) in refs.terrainPoints 
    //   && (xyPos.x + tileWidth) + " " + xyPos.y in refs.terrainPoints) {
    //     drawTri(refs.terrainPoints[(xyPos.x + tileWidth) + " " + (xyPos.y + tileHeight)],
    //       refs.terrainPoints[(xyPos.x + tileWidth) + " " + xyPos.y], screenPos.x <= window.innerWidth/2);
    //   }
    //   if (xyPos.x + tileWidth + " " + (xyPos.y + tileHeight) in refs.terrainPoints
    //   && (xyPos.x + tileWidth) + " " + (xyPos.y + tileHeight) in refs.terrainPoints) {
    //     drawTri(refs.terrainPoints[xyPos.x + " " + (xyPos.y + tileHeight)],
    //       refs.terrainPoints[(xyPos.x + tileWidth) + " " + (xyPos.y + tileHeight)], screenPos.x > window.innerWidth/2);
    //   }
    //   if (screenPos.x <= window.innerWidth/2
    //   && (xyPos.x + tileWidth) + " " + (xyPos.y + tileHeight) in refs.terrainPoints 
    //   && (xyPos.x + tileWidth) + " " + xyPos.y in refs.terrainPoints) {
    //     drawTri(refs.terrainPoints[(xyPos.x + tileWidth) + " " + (xyPos.y + tileHeight)],
    //       refs.terrainPoints[(xyPos.x + tileWidth) + " " + xyPos.y], screenPos.x <= window.innerWidth/2);
    //   }
    // }
    
    const debug0: HTMLParagraphElement | null = document.querySelector("#debug0");
    if (debug0 && debugging) {
      debug0.textContent = "vertices: " + vertexCount + " | " + Object.values(refs.terrainPoints).length;
    }
    const debug1: HTMLParagraphElement | null = document.querySelector("#debug1");
    if (debug1 && debugging) {
      debug1.textContent = "edges: " + lineCount;
    }
    const debug2: HTMLParagraphElement | null = document.querySelector("#debug2");
    if (debug2 && debugging) {
      debug2.textContent = "tris: " + triCount;
    }
  }

  const vertexColor = (baseColor: V3, opacity: number, screenPos: V2): V3 => {
    opacity = Math.max(0, Math.min(1, opacity));
    const bgStartColor: V3 = new V3(97,97,112);
    const bgEndColor: V3 = new V3(15,15,30);
    const bgColor: V3 = bgStartColor.add(bgEndColor.add(bgStartColor.scale(-1))
      .scale(screenPos.y/screenSize.y));
    return bgColor.add(baseColor.add(bgColor.scale(-1)).scale(opacity));
  }

  return (
    <div id="terrain">
      <canvas id="terrain" ref={refs.canvas}></canvas>
      <p id="debug0" style={{position: "absolute", top: "200px", left: "20px", zIndex: 2}}></p>
      <p id="debug1" style={{position: "absolute", top: "240px", left: "20px", zIndex: 2}}></p>
      <p id="debug2" style={{position: "absolute", top: "280px", left: "20px", zIndex: 2}}></p>
      <p id="debug3" style={{position: "absolute", top: "320px", left: "20px", zIndex: 2}}></p>
    </div>
  );
}