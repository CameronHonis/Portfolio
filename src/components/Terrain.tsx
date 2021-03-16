import React from "react";
import { M4 } from "../models/M4";
import { V2 } from "../models/V2";
import { V3 } from "../models/V3";
import { Helpers } from "../models/Helpers";
import { Tri } from "../models/Tri";
import { M2 } from "../models/M2";
import { AppState } from "../App";

const terrainWidth: number = 170;
const tileWidth: number = 8;
const tileHeight: number = 10;
const maxCamSpeed: number = 20;
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
const introAnimTime: [number, number] = [0, 3];
const debugging: boolean = false;

export interface Props {
  appState: AppState;
}

export interface Refs {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  terrainPoints: {
    [index: string]: V3; // index format: xPos + " " + zPos
  };
  terrainDespawnWatch: {[index: string]: number} // string=vertex hash, value=time in despawnWatch
  camera: M4;
  cameraFOV: V2;
  cameraSpeed: number;
  t: number;
  paused: boolean;
  perlinSeed: number[]
  fpsRA: number;
  framesCount: number;
  highlights: Set<{
    highlightPoss: V2[];
    highlightSpeed: V2;
    highlightRadius: number;
    highlightBirth: number;
    maxRadius: number;
  }>;
  nextHighlightTime: number;
  scaffoldColor: V3;
}

export const initRefs: Refs = {
  canvas: React.createRef() as React.MutableRefObject<HTMLCanvasElement>,
  terrainPoints: {},
  terrainDespawnWatch: {},
  camera: new M4(new V3(0,0,0), camDirection),
  cameraFOV: new V2(xFOV, xFOV*Math.min(1.2, .8*window.innerHeight/window.innerWidth)),
  cameraSpeed: 0,
  t: 0,
  paused: false,
  perlinSeed: [],
  fpsRA: 0,
  framesCount: 0,
  highlights: new Set(),
  nextHighlightTime: 8,
  scaffoldColor: new V3(0,0,0),
}

export const Terrain: React.FC<Props> = ({ appState }) => {
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

  React.useEffect(() => {
    const heightWidthRatio: number = appState.viewportSnappedSize.y/appState.viewportSnappedSize.x;
    refs.cameraFOV = new V2(xFOV, xFOV*Math.min(1.2, heightWidthRatio));
  },[appState.viewportSnappedSize]); //eslint-disable-line

  const render = (dt: number) => {
    const screenSize: V2 = new V2(window.innerWidth, window.innerHeight - .1*window.innerWidth);
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
            const perlinHeight: number = perlinMax*(perlinWeights[0]*Helpers.perlinR2(perlinFreqs[0]*x, perlinFreqs[0]*y/1.5, refs.perlinSeed) 
              + perlinWeights[1]*Helpers.perlinR2(perlinFreqs[1]*x, perlinFreqs[1]*y/1.5, refs.perlinSeed) - .5);
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
        refs.t += dt;
        if (refs.t < introAnimTime[0] || refs.t > introAnimTime[1]) {
          refs.cameraSpeed = Math.min(maxCamSpeed, refs.cameraSpeed + .1);
          refs.camera = new M4(
            refs.camera.position.add(new V3(0, dt*refs.cameraSpeed, 0)), 
            refs.camera.position.add(new V3(0, dt*refs.cameraSpeed, 0).add(camDirection))
          );
        }
        for (const highlightObj of refs.highlights) {
          if (refs.t - highlightObj.highlightBirth > 5) {
            refs.highlights.delete(highlightObj);
            continue;
          }
          for (let j = 0; j < highlightObj.highlightPoss.length; ++j) {
            highlightObj.highlightPoss[j] = highlightObj.highlightPoss[j].add(highlightObj.highlightSpeed.scale(dt));
          }
          highlightObj.highlightRadius = 50*(1 - 64*Math.pow((refs.t - highlightObj.highlightBirth)/5 - .5, 6));
        }
        const rt: number = (refs.t % 12) / 12;
        const gt: number = ((refs.t + 4) % 12) / 12;
        const bt: number = ((refs.t + 8) % 12) / 12;
        const r: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(rt - .5) + 1.5)));
        const g: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(gt - .5) + 1.5)));
        const b: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(bt - .5) + 1.5)));
        refs.scaffoldColor = new V3(r, g, b);
        if (refs.t > refs.nextHighlightTime && (refs.t < introAnimTime[0] || refs.t > introAnimTime[1])) {
          refs.nextHighlightTime = Math.random()*5 + refs.t;
          const clusterCenter: V2 = new V2(refs.camera.position.x + (Math.random() - .5)*terrainWidth*1.5, refs.camera.position.y + Math.random()*renderDis*1.2);
          const clusterTarget: V2 = new V2(refs.camera.position.x + (Math.random() - .5)*terrainWidth*.5, refs.camera.position.y + (.5 + Math.random())*renderDis);
          const highlightSpeed = clusterTarget.add(clusterCenter.scale(-1)).unit().scale(60 + Math.random()*60);
          const cluster: V2[] = [];
          for (let i = 0; i < Math.random()*3; ++i) {
            const offsetAngle: number = Math.random()*Math.PI*2;
            cluster.push(clusterCenter.add(new V2(Math.cos(offsetAngle), Math.sin(offsetAngle)).scale(Math.sqrt(Math.random())*100)));
          }
          refs.highlights.add({
            highlightBirth: refs.t,
            highlightPoss: cluster,
            highlightRadius: 0,
            highlightSpeed,
            maxRadius: Math.random()*80,
          })
        }
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
        const getTriOpacities = (minDis: number, maxDis: number): [number, number] => {
          if (minDis > renderDis) { return [0, 0]; }
          const rtn: [number, number] = [1, 1];
          if (refs.t > introAnimTime[0] && refs.t < introAnimTime[1]) {
            const introDur: number = introAnimTime[1] - introAnimTime[0];
            const introProg: number = (refs.t - introAnimTime[0])/introDur;
            const relPos0: number = minDis/renderDis;
            const relPos1: number = maxDis/renderDis;
            const funcx0: number = 2*introProg - relPos0;
            const funcx1: number = 2*introProg - relPos1;
            rtn[0] *= Math.max(0, Math.min(1, funcx0/.7 - .2));
            rtn[1] *= Math.max(0, Math.min(1, funcx1/.7 - .2));
          }
          if (rtn[0]) {
            rtn[0] *= triMaxOpacity*Math.max(1 - fogMax, Math.min(1, 
              (fogEnd - fogStart*(1 - fogMax))/(fogEnd - fogStart) - fogMax*minDis/fogEnd));
          }
          if (rtn[1]) {
            rtn[1] *= triMaxOpacity*Math.max(1 - fogMax, Math.min(1, 
              (fogEnd - fogStart*(1 - fogMax))/(fogEnd - fogStart) - fogMax*furthest[1]/fogEnd));
          }
          return rtn;
        }
        const grad: CanvasGradient = ctx.createLinearGradient(closest[0].x, closest[0].y, furthest[0].x, furthest[0].y);
        const opacities: [number, number] = getTriOpacities(closest[1], furthest[1]);
        if (opacities[0] && opacities[1]) {
          // draw tri
          const closeColor: V3 = vertexColor(faceColor, opacities[0], closest[0]);
          const farColor: V3 = vertexColor(faceColor, opacities[1], furthest[0]);
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
        const tri01: M2 = new M2(tri.p0, tri.p1);
        const tri02: M2 = new M2(tri.p0, tri.p2);
        const tri12: M2 = new M2(tri.p1, tri.p2);
        const tri01Hash: string = tri01.hash();
        const tri02Hash: string = tri02.hash();
        const tri12Hash: string = tri12.hash();
        edgeTris[tri01Hash]--;
        if (!edgeTris[tri01Hash]) {
          drawLine(tri01, triDiss.x, triDiss.y);
        }
        edgeTris[tri02Hash]--;
        if (!edgeTris[tri02Hash]) {
          drawLine(tri02, triDiss.x, triDiss.z);
        }
        edgeTris[tri12Hash]--;
        if (!edgeTris[tri12Hash]) {
          drawLine(tri12, triDiss.y, triDiss.z);
        }
      }
      const getVertexOpacity = (dis: number, vHash: string): number | null => {
        let rtn: number = 1;
        if (refs.t < introAnimTime[1] && refs.t >= introAnimTime[0]) {
          const introDur: number = introAnimTime[1] - introAnimTime[0];
          const introProg: number = (refs.t - introAnimTime[0])/introDur;
          const relPos: number = dis/renderDis;
          const funcx: number = 2*introProg - relPos;
          if (funcx < .7) {
            rtn *= Math.max(0, (funcx)/.7);
          } else {
            rtn *= Math.max(0, Math.min(1, -((funcx) - 1)/.3));
          }
        } else {
          rtn *= Math.max(0, Math.min(1, vertexOpacities[vHash]));
        }
        rtn *= Math.max(1 - fogMax, Math.min(1, 
          (fogEnd - fogStart*(1 - fogMax))/(fogEnd - fogStart) - fogMax*dis/fogEnd));
        return rtn;
      }
      const getBaseVertexColor = (): V3 => {
        if (refs.t < introAnimTime[1] && refs.t >= introAnimTime[0]) {
          return new V3(255,255,255);
        } else {
          return refs.scaffoldColor;
        }
      }
      const drawVertex = (screenPos: V2, dis: number) => { //eslint-disable-line
        const vHash: string = screenPos.x + " " + screenPos.y;
        let netOpacity: number | null = getVertexOpacity(dis, vHash);
        if (!netOpacity || netOpacity <= 0) { return; }
        const color: V3 = vertexColor(getBaseVertexColor(), netOpacity, screenPos);
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
        const screenPos0: V2 = new V2(line.x0, line.y0);
        const screenPos1: V2 = new V2(line.x1, line.y1);
        const sp0Hash: string = screenPos0.x + " " + screenPos0.y;
        const sp1Hash: string = screenPos1.x + " " + screenPos1.y;
        let netOpacity0: number | null = getVertexOpacity(minDis, sp0Hash);
        let netOpacity1: number | null = getVertexOpacity(maxDis, sp1Hash);
        if (!netOpacity0) { netOpacity0 = 0; }
        if (!netOpacity1) { netOpacity1 = 0; }
        if (netOpacity0 === 0 && netOpacity1 === 0) { return; }
        const grad: CanvasGradient = ctx.createLinearGradient(line.x0, line.y0, line.x1, line.y1);
        const baseColor: V3 = getBaseVertexColor();
        const color: V3 = vertexColor(baseColor, netOpacity0, screenPos0);
        const color2: V3 = vertexColor(baseColor, netOpacity1, screenPos1);
        grad.addColorStop(0, "rgb(" + color.x + "," + color.y + "," + color.z + ")");
        grad.addColorStop(1, "rgb(" + color2.x + "," + color2.y + "," + color2.z + ")");
        ctx.beginPath();
        ctx.moveTo(line.x0, line.y0);
        ctx.lineTo(line.x1, line.y1);
        ctx.strokeStyle = grad;
        ctx.lineWidth = .6*anchorLength*maxDotSize/(.5*minDis + .5*maxDis);
        ctx.stroke();
        lineCount++;
        ctx.closePath();
      }
      const screenPoss: {[index: string]: V2} = {};
      // 1st idx undefined if inserted then overlapped; 1=screenPoss, 2=diss, 3=colors, 4=vertexHashes
      const sortedTris: [Tri, V3, V3, [string, string, string]][] = [];
      const edgeTris: {[index: string]: number} = {};
      const vertexOpacities: {[index: string]: number} = {};
      for (const [ tpHash, tp] of Object.entries(refs.terrainPoints)) { // adds tris sorted by lowest to highest cam dis
        if (!(tpHash in refs.terrainDespawnWatch)) { refs.terrainDespawnWatch[tpHash] = 0; }
        if (!(tpHash in screenPoss)) {
          screenPoss[tpHash] = refs.camera.pointToScreenPos(tp, refs.cameraFOV, screenSize);
        }
        const tpXY: V2 = new V2(tp.x, tp.y);
        let highestOpacity: number | undefined = undefined;
        for (const highlightObj of refs.highlights) {
          for (const highlightPos of highlightObj.highlightPoss) {
            const hpDis: number = highlightPos.add(tpXY.scale(-1)).magnitude();
            if (hpDis >= highlightObj.highlightRadius) { continue; }
            const hpOpacity: number = 1 - 4*Math.pow(hpDis/highlightObj.highlightRadius - .5, 2);
            if (!highestOpacity || hpOpacity > highestOpacity) {
              highestOpacity = hpOpacity;
            }
          }
        }
        if (highestOpacity) {
          vertexOpacities[screenPoss[tpHash].x + " " + screenPoss[tpHash].y] = highestOpacity;
        }
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
      const trisToDraw: [Tri, V3, V3, [string, string, string]][] = [];
      const verticesToDraw: [V2, number][] = [];
      // filter sortedTris
      for (let i = sortedTris.length-1; i >= 0; --i) {
        const iTri: Tri = sortedTris[i][0];
        const drawVertices: [boolean, boolean, boolean] = [true, true, true];
        let overlapped: boolean = false;
          // not playing introAnim
          // filter vertices and tris overlapped
          for (let j = i-1; j >= 0; --j) {
            const jTri: Tri = sortedTris[j][0];
            const p0in: boolean = jTri.pointInscribed(iTri.p0);
            const p1in: boolean = jTri.pointInscribed(iTri.p1);
            const p2in: boolean = jTri.pointInscribed(iTri.p2);
            drawVertices[0] = drawVertices[0] && !p0in;
            drawVertices[1] = drawVertices[1] && !p1in;
            drawVertices[2] = drawVertices[2] && !p2in;
            if (p0in && p1in && p2in) {
              overlapped = true;
              break;
            }
          }
        if (!overlapped) { 
          trisToDraw.push(sortedTris[i]);
          const tri01Hash: string = new M2(iTri.p0, iTri.p1).hash();
          if (!(tri01Hash in edgeTris)) { edgeTris[tri01Hash] = 0; }
          edgeTris[tri01Hash]++;
          const tri02Hash: string = new M2(iTri.p0, iTri.p2).hash();
          if (!(tri02Hash in edgeTris)) { edgeTris[tri02Hash] = 0; }
          edgeTris[tri02Hash]++;
          const tri12Hash: string = new M2(iTri.p1, iTri.p2).hash();
          if (!(tri12Hash in edgeTris)) { edgeTris[tri12Hash] = 0; }
          edgeTris[tri12Hash]++;
          if (drawVertices[0]) { verticesToDraw.push([iTri.p0, sortedTris[i][1].x]); }
          if (drawVertices[1]) { verticesToDraw.push([iTri.p1, sortedTris[i][1].y]); }
          if (drawVertices[2]) { verticesToDraw.push([iTri.p2, sortedTris[i][1].z]); }
        }
      }
      for (const triToDraw of trisToDraw) {
        drawTri(...triToDraw);
      }
      for (const vertToDraw of verticesToDraw) {
        drawVertex(...vertToDraw);
      }
    }; setCanvas();
    
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
    const screenSize: V2 = new V2(window.innerWidth, window.innerHeight - .1*window.innerWidth);
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