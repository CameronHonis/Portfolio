import React from "react";
import WebGLDebugUtil from "webgl-debug";
import { M4 } from "../models/M4";
import { V2 } from "../models/V2";
import { V3 } from "../models/V3";
import { Helpers } from "../services/Helpers";
import { Tri } from "../models/Tri";
import { M2 } from "../models/M2";
import { AppState } from "../App";
import { mat4, vec2, vec3, vec4 } from "gl-matrix";
import { ShaderData, WebGLServices } from "../services/Webgl";
import { Triangle } from "../models/Triangle";
import { Mesh } from "../models/Mesh";
import { Icosphere } from "../models/Icosphere";
import { EdgeCap } from "../models/EdgeCap";
import { Vertex } from "../models/Vertex";
// @ts-ignore
import vs0 from "!raw-loader!../shaders/vertexShader0.glsl";
// @ts-ignore
import fs0 from "!raw-loader!../shaders/fragmentShader0.glsl";

const terrainWidth: number = 170;
const tileWidth: number = 8;
const tileHeight: number = 10;
const maxCamSpeed: number = 1;
const camDirection: V3 = new V3(0, 1, -.05);
const renderDis: number = 220;
const perlinWeights: number[] = [.42, .08];
const perlinFreqs: number[] = [.05, .7];
const perlinMax: number = 40;
const canyonDropoff: number = .12;
const canyonMax: number = 15;
const defaultTerrainHeight: number = 0;
const fogStart: number = 0;
const fogEnd: number = .98*renderDis;
const fogMin: number = 0;
const fogMax: number = 1;
const fogTransform: [number, number, number] = [0, 2, -1];
const maxDotSize: number = .3;
const triColorDark: V3 = new V3(0, 0, 0);
const triColorLight: V3 = new V3(20, 20, 80);
const triMaxOpacity: number = .7;
const introAnimTime: [number, number] = [0, 3];
const debugging: boolean = true;

export interface Props {
  appState: AppState;
}

export interface Refs {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  terrainPoints: {
    [index: string]: { // index format: xPos + " " + zPos
      vertexPosition: vec3;
      backwardDiagTriangle?: Mesh;
      leftDiagTriangle?: Mesh;
      vertexCap: Icosphere;
      backwardEdgeCap?: EdgeCap;
      diagEdgeCap?: EdgeCap;
      leftEdgeCap?: EdgeCap;
    };
  };
  terrainZBounds: vec2;
  opaqueMeshes: Mesh[];
  transparentMeshes: Mesh[];
  cameraMatrix: mat4;
  cameraSpeed: number;
  t: number;
  paused: boolean;
  perlinSeed: number[]
  fpsRA: number;
  framesCount: number;
  highlights: Set<{
    highlightPoss: vec2[];
    highlightSpeed: vec2;
    highlightRadius: number;
    highlightBirth: number;
    maxRadius: number;
  }>;
  nextHighlightTime: number;
  scaffoldColor: vec3;
}

export const initRefs: Refs = {
  canvas: React.createRef() as React.MutableRefObject<HTMLCanvasElement>,
  terrainPoints: {},
  terrainZBounds: vec2.fromValues(0, 0),
  opaqueMeshes: [],
  transparentMeshes: [],
  cameraMatrix: WebGLServices.mat4(),
  cameraSpeed: 0,
  t: 0,
  paused: false,
  perlinSeed: [],
  fpsRA: 0,
  framesCount: 0,
  highlights: new Set(),
  nextHighlightTime: 8,
  scaffoldColor: vec3.create(),
}

export const Terrain: React.FC<Props> = ({ appState }) => {
  let { current: refs } = React.useRef<Refs>(initRefs);

  React.useEffect(() => {
    document.addEventListener("resize", () => {

    });
    if (debugging) {
      document.addEventListener("keydown", (e) => {
        console.log(e.key.toLowerCase());
        if (e.key.toLowerCase() === " ") {
          refs.paused = !refs.paused;
        } else if (e.key.toLowerCase() === "arrowup") {
          
        } else if (e.key.toLowerCase() === "arrowdown") {
          
        } else if (e.key.toLowerCase() === "arrowright") {
          
        } else if (e.key.toLowerCase() === "arrowleft") {
          
        }
      });
    }
    for (let i = 0; i < 7; ++i) {
      refs.perlinSeed.push(Math.random()*30000);
    }
    const terrainClock = (t0: number, t1: number, gl: WebGLRenderingContext, program: WebGLProgram) => {
      const dt: number = t1 - t0;
      updateScene(dt/1000, gl, program);
      if (debugging) {
        const debug3: HTMLParagraphElement | null = document.querySelector("#debug3");
        if (debug3) {
          refs.fpsRA = refs.fpsRA*(Math.min(refs.framesCount, 10)-1)/Math.min(refs.framesCount,10) + 1000/dt/Math.min(refs.framesCount,10);
          debug3.textContent = "FPS: " + Helpers.roundToPow(1000/dt, -1);//+ Helpers.roundToPow(refs.fpsRA, -1);
        }
      }
      refs.framesCount++;
      window.requestAnimationFrame(t2 => terrainClock(t1, t2, gl, program));
    }
    const canv: HTMLCanvasElement = refs.canvas.current;
    const styledWidth: number = +getComputedStyle(canv).getPropertyValue("width").slice(0,-2);
    const styledHeight: number = +getComputedStyle(canv).getPropertyValue("height").slice(0,-2);
    const dpr: number = window.devicePixelRatio;
    canv.setAttribute("width", styledWidth*dpr + "px");
    canv.setAttribute("height", styledHeight*dpr + "px");
    if (canv) {
      let gl: WebGLRenderingContext = refs.canvas.current.getContext("webgl") as WebGLRenderingContext;
      if (!gl) { throw new Error("Unable to render with WebGL, your browser or machine may not support it :("); }
      // link webgl debugger
      gl = WebGLDebugUtil.makeDebugContext(gl, undefined, (a: string, b: any[]) => {
        for (let i = 0; i < b.length; ++i) {
          if (b[i] === undefined) {
            console.error("undefined passed to gl." + a + "(" + WebGLDebugUtil.glFunctionArgsToString(a, b) + ")")
          }
        }
      });
      // initialize shader programs
      const vs0Data: ShaderData = {type: gl.VERTEX_SHADER, source: vs0};
      const fs0Data: ShaderData = {type: gl.FRAGMENT_SHADER, source: fs0};
      const program0: WebGLProgram = WebGLServices.createProgramWithShaders(gl, [vs0Data, fs0Data]);
      window.requestAnimationFrame(t0 => terrainClock(t0, t0, gl, program0));
    }
  },[]); //eslint-disable-line

  React.useEffect(() => {

  },[appState.viewportSnappedSize]); //eslint-disable-line

  const getTerrainHeight = (x: number, z: number): number => {
    const perlinHeight: number = perlinMax*(perlinWeights[0]*Helpers.perlinR2(perlinFreqs[0]*x, perlinFreqs[0]*z/1.5, refs.perlinSeed) 
    + perlinWeights[1]*Helpers.perlinR2(perlinFreqs[1]*x, perlinFreqs[1]*z/1.5, refs.perlinSeed) - .5);
    const canyonHeight: number = canyonMax*(1 - 1/(1+Math.pow(Math.E, Math.abs(canyonDropoff*x) - 4)));
    return perlinHeight + canyonHeight + defaultTerrainHeight;
  }

  const updateScene = (dt: number, gl: WebGLRenderingContext, pr: WebGLProgram) => {
    const screenSize: V2 = new V2(window.innerWidth, window.innerHeight - .1*window.innerWidth);
    // console.log(refs.camera.position.toString(), viewBB[0].toString(), viewBB[1].toString());
    const spawnDespawn = (): void => {
      const xTileRange: [number, number] = [
        tileWidth*Math.floor(-terrainWidth/tileWidth),
        tileWidth*Math.ceil(terrainWidth/tileWidth),
      ];
      while (refs.terrainZBounds[0] < refs.cameraMatrix[14]) {
        // despawn row behind camera
        const transparentDeleteIdxs: Set<number> = new Set();
        const opaqueDeleteIdxs: Set<number> = new Set();
        for (let x = xTileRange[0]; x <= xTileRange[1]; x += tileWidth) {
          const hash: string = x + " " + refs.terrainZBounds[0];
          if (hash in refs.terrainPoints) {
            transparentDeleteIdxs.add(refs.terrainPoints[hash].vertexCap.worldArrayIdx);
            if (refs.terrainPoints[hash].backwardEdgeCap) {
              transparentDeleteIdxs.add(refs.terrainPoints[hash].backwardEdgeCap!.worldArrayIdx);
            }
            if (refs.terrainPoints[hash].diagEdgeCap) {
              transparentDeleteIdxs.add(refs.terrainPoints[hash].diagEdgeCap!.worldArrayIdx);
            }
            if (refs.terrainPoints[hash].leftEdgeCap) {
              transparentDeleteIdxs.add(refs.terrainPoints[hash].leftEdgeCap!.worldArrayIdx);
            }
            if (refs.terrainPoints[hash].backwardDiagTriangle) {
              opaqueDeleteIdxs.add(refs.terrainPoints[hash].backwardDiagTriangle!.worldArrayIdx);
            }
            if (refs.terrainPoints[hash].leftDiagTriangle) {
              opaqueDeleteIdxs.add(refs.terrainPoints[hash].leftDiagTriangle!.worldArrayIdx);
            }
          }
        }
        // delete idxs from mesh arrays
        let pointer0: number = 0;
        for (let i = 0; i < refs.opaqueMeshes.length; ++i) {
          if (!opaqueDeleteIdxs.has(i)) {
            refs.opaqueMeshes[pointer0] = refs.opaqueMeshes[i];
            pointer0++;
          }
        }
        for (let i = 0; i < opaqueDeleteIdxs.size; ++i) {
          refs.opaqueMeshes.pop();
        }
        pointer0 = 0;
        for (let i = 0; i < refs.opaqueMeshes.length; ++i) {
          if (!transparentDeleteIdxs.has(i)) {
            transparentDeleteIdxs[pointer0] = transparentDeleteIdxs[i];
            pointer0++;
          }
        }
        for (let i = 0; i < refs.transparentMeshes.length; ++i) {
          refs.transparentMeshes.pop();
        }
      }
      while (refs.terrainZBounds[1] < refs.cameraMatrix[14] + renderDis) {
        // spawn next row
        const nextZ: number = refs.terrainZBounds[1] + tileHeight;
        let leftHash: string = (xTileRange[0] - tileWidth) + " " + nextZ;
        for (let x = xTileRange[0]; x <= xTileRange[1]; x += tileWidth) {
          const currPosition: vec3 = vec3.fromValues(x, getTerrainHeight(x, nextZ), nextZ);
          const diagHash: string = (x - tileWidth) + " " + (nextZ - tileHeight);
          const backwardHash: string = x + " " + (nextZ - tileHeight);
          let backwardDiagTriangle: Mesh | undefined = undefined, leftDiagTriangle: Mesh | undefined = undefined;
          let leftEdgeCap: EdgeCap | undefined = undefined, diagEdgeCap: EdgeCap | undefined = undefined;
          let backwardEdgeCap: EdgeCap | undefined = undefined;
          if (leftHash in refs.terrainPoints && diagHash in refs.terrainPoints) {
            const leftPosition: vec3 = refs.terrainPoints[leftHash].vertexPosition;
            const diagPosition: vec3 = refs.terrainPoints[diagHash].vertexPosition;
            const leftNormal: vec3 = WebGLServices.calcNormal(leftPosition, currPosition, diagPosition);
            const currNormal: vec3 = WebGLServices.calcNormal(currPosition, diagPosition, leftPosition);
            const diagNormal: vec3 = WebGLServices.calcNormal(diagPosition, leftPosition, currPosition);
            leftDiagTriangle = new Mesh({ shaderProgram: pr, color: vec4.fromValues(.0784, .0784, .3137, 1)});
            leftDiagTriangle.triangles.push(new Triangle(
              new Vertex({position: leftPosition, normal: leftNormal}),
              new Vertex({position: currPosition, normal: currNormal}),
              new Vertex({position: diagPosition, normal: diagNormal}),
            ));
            leftDiagTriangle.worldArrayIdx = refs.opaqueMeshes.length;
            refs.opaqueMeshes.push(leftDiagTriangle);
          }
          if (backwardHash in refs.terrainPoints && diagHash in refs.terrainPoints) {
            const backPosition: vec3 = refs.terrainPoints[backwardHash].vertexPosition;
            const diagPosition: vec3 = refs.terrainPoints[diagHash].vertexPosition;
            const backNormal: vec3 = WebGLServices.calcNormal(backPosition, diagPosition, currPosition);
            const diagNormal: vec3 = WebGLServices.calcNormal(diagPosition, currPosition, backPosition);
            const currNormal: vec3 = WebGLServices.calcNormal(currPosition, backPosition, diagPosition);
            backwardDiagTriangle = new Mesh({ shaderProgram: pr, color: vec4.fromValues(.0784, .0784, .3137, 1)});
            backwardDiagTriangle.triangles.push(new Triangle(
              new Vertex({position: backPosition, normal: backNormal}),
              new Vertex({position: diagPosition, normal: diagNormal}),
              new Vertex({position: currPosition, normal: currNormal}),
            ));
            backwardDiagTriangle.worldArrayIdx = refs.opaqueMeshes.length;
            refs.opaqueMeshes.push(backwardDiagTriangle);
          }
          if (backwardHash in refs.terrainPoints) {
            const backPosition: vec3 = refs.terrainPoints[backwardHash].vertexPosition;
            backwardEdgeCap = new EdgeCap({ shaderProgram: pr, color: vec4.fromValues(0,0,0,0), ambientLight: 1});
            backwardEdgeCap.worldArrayIdx = refs.transparentMeshes.length;
            refs.transparentMeshes.push(backwardEdgeCap);
            WebGLServices.attachEdgecap(backwardEdgeCap, backPosition, currPosition);
          }
          if (diagHash in refs.terrainPoints) {
            const diagPosition: vec3 = refs.terrainPoints[diagHash].vertexPosition;
            diagEdgeCap = new EdgeCap({ shaderProgram: pr, color: vec4.fromValues(0,0,0,0), ambientLight: 1});
            diagEdgeCap.worldArrayIdx = refs.transparentMeshes.length;
            refs.transparentMeshes.push(diagEdgeCap);
            WebGLServices.attachEdgecap(diagEdgeCap, diagPosition, currPosition);
          }
          if (leftHash in refs.terrainPoints) {
            const leftPosition: vec3 = refs.terrainPoints[leftHash].vertexPosition;
            leftEdgeCap = new EdgeCap({ shaderProgram: pr, color: vec4.fromValues(0,0,0,0), ambientLight: 1});
            leftEdgeCap.worldArrayIdx = refs.transparentMeshes.length;
            refs.transparentMeshes.push(leftEdgeCap);
            WebGLServices.attachEdgecap(leftEdgeCap, leftPosition, currPosition);
          }
          const vertexCap: Icosphere = new Icosphere({shaderProgram: pr, matrix: WebGLServices.mat4(currPosition), ambientLight: 1});
          vertexCap.worldArrayIdx = refs.transparentMeshes.length;
          refs.transparentMeshes.push(vertexCap);

          refs.terrainPoints[x + " " + nextZ] = {
            vertexPosition: currPosition,
            vertexCap,
            leftDiagTriangle,
            backwardDiagTriangle,
            leftEdgeCap,
            diagEdgeCap,
            backwardEdgeCap,
          };
          // set leftHash for next iteration
          leftHash = x + " " + nextZ;
        }
        // update terrain bounds
        refs.terrainZBounds[1] = nextZ;
      }
    }; spawnDespawn();
    const incrementPhys = (): void => {
      if (refs.paused) return;
      refs.t += dt;
      if (refs.t < introAnimTime[0] || refs.t > introAnimTime[1]) {
        refs.cameraSpeed = Math.min(maxCamSpeed, refs.cameraSpeed + dt);
        mat4.translate(refs.cameraMatrix, refs.cameraMatrix, vec3.fromValues(0, 0, -dt*refs.cameraSpeed));
      }
      for (const highlightObj of refs.highlights) {
        if (refs.t - highlightObj.highlightBirth > 5) {
          refs.highlights.delete(highlightObj);
          continue;
        }
        for (let j = 0; j < highlightObj.highlightPoss.length; ++j) {
          const highlightVelo: vec2 = vec2.create();
          vec2.scale(highlightVelo, highlightObj.highlightSpeed, dt);
          vec2.add(highlightObj.highlightPoss[j], highlightObj.highlightPoss[j], highlightVelo);
        }
        highlightObj.highlightRadius = 50*(1 - 64*Math.pow((refs.t - highlightObj.highlightBirth)/5 - .5, 6));
      }
      const rt: number = (refs.t % 12) / 12;
      const gt: number = ((refs.t + 4) % 12) / 12;
      const bt: number = ((refs.t + 8) % 12) / 12;
      const r: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(rt - .5) + 1.5)));
      const g: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(gt - .5) + 1.5)));
      const b: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(bt - .5) + 1.5)));
      refs.scaffoldColor = vec3.fromValues(r, g, b);
      if (refs.t > refs.nextHighlightTime && (refs.t < introAnimTime[0] || refs.t > introAnimTime[1])) {
        refs.nextHighlightTime = Math.random()*5 + refs.t;
        const clusterCenterX: number = refs.cameraMatrix[12] + (Math.random() - .5)*terrainWidth*1.5;
        const clusterCenterZ: number = refs.cameraMatrix[14] + Math.random()*renderDis*1.2;
        const clusterTargetX: number = refs.cameraMatrix[14] + (Math.random() - .5)*terrainWidth*.5;
        const clusterTargetZ: number = refs.cameraMatrix[12] + (Math.random() + .5)*renderDis;
        const highlightSpeed: vec2 = vec2.fromValues(clusterTargetX - clusterCenterX, clusterTargetZ - clusterCenterZ);
        vec2.normalize(highlightSpeed, highlightSpeed);
        vec2.scale(highlightSpeed, highlightSpeed, 60 + Math.random()*60);
        const cluster: vec2[] = [];
        for (let i = 0; i < Math.random()*3; ++i) {
          const offsetAngle: number = Math.random()*Math.PI*2;
          const offsetMag: number = Math.sqrt(Math.random())*100;
          const spotPos: vec2 = vec2.fromValues(clusterCenterX, clusterCenterZ);
          vec2.add(spotPos, spotPos, vec2.fromValues(Math.cos(offsetAngle)*offsetMag, Math.sin(offsetAngle)*offsetMag));
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
    const render = (): void => {
      const testMesh0: Mesh = new Mesh({ shaderProgram: pr, ambientLight: 1});
      const testTri0: Triangle = new Triangle(
        new Vertex({position: vec3.fromValues(0,2,-5), normal: vec3.fromValues(0,0,1)}),
        new Vertex({position: vec3.fromValues(-2, -1, -5), normal: vec3.fromValues(0,0,1)}),
        new Vertex({position: vec3.fromValues(2, -1, -5), normal: vec3.fromValues(0,0,1)})
      );
      testMesh0.triangles.push(testTri0);
      const lightPosition: vec3 = vec3.fromValues(refs.cameraMatrix[12], refs.cameraMatrix[13], refs.cameraMatrix[14]);
      vec3.add(lightPosition, lightPosition, vec3.fromValues(20, 100, 0));
      WebGLServices.renderScene({gl, opaqueMeshes: [testMesh0], transparentMeshes: [], cameraMatrix: refs.cameraMatrix, 
        lightPosition, fogStart, fogEnd, fogMin, fogMax, fogTransform});
    }; render();
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