import React from "react";
import WebGLDebugUtil from "webgl-debug";
import { Helpers } from "../services/Helpers";
import { AppState } from "../App";
import { mat4, vec2, vec3 } from "gl-matrix";
import { WebGLServices2, BASE_VERTEX_BYTES } from "../services/Webgl2";

// TERRAIN PARAMS
const tilesWide: number = 40;
const tilesLong: number = 40;
const tileWidth: number = 6;
const tileHeight: number = 4;
const perlinWeights: number[] = [.35, .15];
const perlinFreqs: number[] = [.05, .1];
const perlinMax: number = 40;
const canyonDropoff: number = .1;
const canyonMax: number = 20;
const defaultTerrainHeight: number = 4;

// CAMERA/RENDERING PARAMS
const maxCamSpeed: number = 10;
// const camDirection: V3 = new V3(0, 1, -.05);
const FOVY: number = Math.PI/1.7;
const lightPosition: vec3 = vec3.fromValues(0, 2000, 200);
const ambientLight: number = .1;
const fogStart: number = 0;
const fogEnd: number = .98*tilesLong*tileHeight;
const fogMin: number = 0;
const fogMax: number = 1;
const fogTransform: [number, number, number] = [0, 2, -1];
const introAnimTime: number = 4;

// DEV ENVIRONMENT PARAMS
const debugging: boolean = false;

export interface Props {
  appState: AppState;
}

export interface Highlight {
  pos: vec2;
  velo: vec2;
  radius: number;
  birth: number;
  death: number;
  maxRadius: number;
}

export interface Refs {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  terrainPoints: {[index: string]: vec3}
  nextSpawn: vec2;
  cameraMatrix: mat4;
  cameraSpeed: number;
  t: number;
  paused: boolean;
  perlinSeed: number[];
  fpsRA: number;
  framesCount: number;
  highlights: Highlight[];
  nextHighlightTime: number;
  scaffoldColor: vec3;
}

export const initRefs: Refs = {
  canvas: React.createRef() as React.MutableRefObject<HTMLCanvasElement>,
  terrainPoints: {},
  nextSpawn: vec2.fromValues(tilesWide, 1),
  cameraMatrix: mat4.fromValues(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),
  cameraSpeed: 0,
  t: 0,
  paused: false,
  perlinSeed: [],
  fpsRA: 0,
  framesCount: 0,
  highlights: [
    {
      pos: vec2.create(),
      velo: vec2.create(),
      radius: 0,
      birth: 0,
      death: 0,
      maxRadius: 0
    },
    {
      pos: vec2.create(),
      velo: vec2.create(),
      radius: 0,
      birth: 0,
      death: 0,
      maxRadius: 0,
    },
    {
      pos: vec2.create(),
      velo: vec2.create(),
      radius: 0,
      birth: 0,
      death: 0,
      maxRadius: 0,
    },
    {
      pos: vec2.create(),
      velo: vec2.create(),
      radius: 0,
      birth: 0,
      death: 0,
      maxRadius: 0,
    }
  ],
  nextHighlightTime: 8,
  scaffoldColor: vec3.create(),
}

export const Terrain: React.FC<Props> = ({ appState }) => {
  let { current: refs } = React.useRef<Refs>(initRefs);

  React.useEffect(() => {
    if (debugging) {
      document.addEventListener("keydown", (e) => {
        console.log(e.key.toLowerCase());
        if (e.key.toLowerCase() === " ") {
          refs.paused = !refs.paused;
        } else if (e.key.toLowerCase() === "arrowup") {
          
        } else if (e.key.toLowerCase() === "arrowdown") {
          
        } else if (e.key.toLowerCase() === "arrowright") {
          
        } else if (e.key.toLowerCase() === "arrowleft") {
          
        } else if (e.key.toLowerCase() === "p") {
          const logStack: [number, number, number, number, number, number][] = [];
          const dv = new DataView(WebGLServices2.baseVertexBufferData);
          for (let i = 0; i < dv.byteLength/BASE_VERTEX_BYTES; ++i) {
            logStack.push([
              dv.getFloat32(BASE_VERTEX_BYTES*i, true),
              dv.getFloat32(BASE_VERTEX_BYTES*i + 4, true),
              dv.getFloat32(BASE_VERTEX_BYTES*i + 8, true),
              dv.getInt8(BASE_VERTEX_BYTES*i + 12),
              dv.getInt8(BASE_VERTEX_BYTES*i + 13),
              dv.getInt8(BASE_VERTEX_BYTES*i + 14)
            ]);
          }
          console.log(logStack);
        } else if (e.key.toLowerCase() === "o") {
          console.log(new DataView(WebGLServices2.highlightVertexBufferData));
          // const logStack: [number, number, number][] = [];
          // const dv: DataView = new DataView(WebGLServices2.highlightVertexBufferData);
          // for (let i = 0; i < dv.byteLength/HL_VERTEX_BYTES; ++i) {
          //   logStack.push([
          //     dv.getFloat32(HL_VERTEX_BYTES*i, true),
          //     dv.getFloat32(HL_VERTEX_BYTES*i + 4, true),
          //     dv.getFloat32(HL_VERTEX_BYTES*i + 8, true),
          //   ]);
          // }
          // console.log(logStack);
        } else if (e.key.toLowerCase() === "q") {
          mat4.translate(refs.cameraMatrix, refs.cameraMatrix, [0, -1, 0]);
        } else if (e.key.toLowerCase() === "e") {
          mat4.translate(refs.cameraMatrix, refs.cameraMatrix, [0, 1, 0]);
        } else if (e.key.toLowerCase() === "w") {
          mat4.translate(refs.cameraMatrix, refs.cameraMatrix, [0, 0, -1]);
        } else if (e.key.toLowerCase() === "a") {
          mat4.translate(refs.cameraMatrix, refs.cameraMatrix, [-1, 0, 0]);
        } else if (e.key.toLowerCase() === "s") {
          mat4.translate(refs.cameraMatrix, refs.cameraMatrix, [0, 0, 1]);
        } else if (e.key.toLowerCase() === "d") {
          mat4.translate(refs.cameraMatrix, refs.cameraMatrix, [1, 0, 0]);
        }
      });
    }
    for (let i = 0; i < 7; ++i) {
      refs.perlinSeed.push(Math.random()*30000);
    }
    const terrainClock = (t0: number, t1: number, gl: WebGLRenderingContext) => {
      const dt: number = t1 - t0;
      updateScene(Math.min(1, dt/1000), gl);
      if (debugging) {
        const debug3: HTMLParagraphElement | null = document.querySelector("#debug3");
        if (debug3) {
          refs.fpsRA = refs.fpsRA*(Math.min(refs.framesCount, 10)-1)/Math.min(refs.framesCount,10) + 1000/dt/Math.min(refs.framesCount,10);
          debug3.textContent = "FPS: " + Helpers.roundToPow(1000/dt, -1);//+ Helpers.roundToPow(refs.fpsRA, -1);
        }
      }
      refs.framesCount++;
      window.requestAnimationFrame(t2 => terrainClock(t1, t2, gl));
    }
    let gl: WebGLRenderingContext = refs.canvas.current.getContext("webgl") as WebGLRenderingContext;
    if (!gl) { throw new Error("Unable to render with WebGL, your browser or machine may not support it :("); }
    if (debugging) {
      // link webgl debugger
      gl = WebGLDebugUtil.makeDebugContext(gl, undefined, (a: string, b: any[]) => {
        for (let i = 0; i < b.length; ++i) {
          if (b[i] === undefined) {
            console.error("undefined passed to gl." + a + "(" + WebGLDebugUtil.glFunctionArgsToString(a, b) + ")")
          }
        }
      });
    }
    // initialize shader programs
    WebGLServices2.initProgram({ gl, maxHeight: tilesLong, maxWidth: tilesWide, tileHeight,
      lightPosition, fogStart, fogEnd, fogMin, fogMax, fogTransform, ambientLight, introAnimTime});
    // create terrain mesh
    window.requestAnimationFrame(t0 => terrainClock(t0, t0, gl));
  },[]); //eslint-disable-line

  const getTerrainHeight = (x: number, z: number): number => {
    const perlinHeight: number = perlinMax*(perlinWeights[0]*Helpers.perlinR2(perlinFreqs[0]*x, perlinFreqs[0]*z, refs.perlinSeed) 
    + perlinWeights[1]*Helpers.perlinR2(perlinFreqs[1]*x, perlinFreqs[1]*z, refs.perlinSeed) - .5);
    const canyonHeight: number = canyonMax*(1 - 1/(1+Math.pow(Math.E, Math.abs(canyonDropoff*x) - 4)));
    return perlinHeight + canyonHeight + defaultTerrainHeight;
  }

  const updateScene = (dt: number, gl: WebGLRenderingContext) => {
    const spawnDespawn = (): void => {
      const vertexAddStack: vec2[] = [];
      const spawnPoint = (stdPos: vec2): void => {
        const [ x, z ] = [ stdPos[0]*tileWidth, stdPos[1]*tileHeight ];
        const pos: vec3 = vec3.fromValues(x, getTerrainHeight(x, z), z);
        refs.terrainPoints[stdPos[0] + " " + stdPos[1]] = pos;
        vertexAddStack.push(vec2.fromValues(stdPos[0], stdPos[1]));
      }
      const incrementNextSpawn = (): void => {
        // console.log("increment " + refs.nextSpawn);
        vec2.add(refs.nextSpawn, refs.nextSpawn, vec2.fromValues(1, 0));
        if (refs.nextSpawn[0] > tilesWide/2) {
          refs.nextSpawn = vec2.fromValues(Math.ceil(-tilesWide/2), refs.nextSpawn[1] - 1);
        }
        // console.log(refs.nextSpawn);
      }
      while (refs.nextSpawn[1]*tileHeight > tileHeight*refs.nextSpawn[0]/tilesWide 
        + refs.cameraMatrix[14] - tilesLong*tileHeight - tileHeight/2) {
        spawnPoint(refs.nextSpawn);
        incrementNextSpawn();
      }
      // send new tris to gl
      if (vertexAddStack.length) {
        WebGLServices2.addTerrainTile(vertexAddStack, refs.terrainPoints, 
          vec3.fromValues(refs.cameraMatrix[12], refs.cameraMatrix[13], refs.cameraMatrix[14]));
      }
    }; spawnDespawn();
    const incrementPhys = (): void => {
      if (refs.paused) return;
      refs.t += dt;
      if (refs.t > introAnimTime) {
        refs.cameraSpeed = Math.min(maxCamSpeed, refs.cameraSpeed + maxCamSpeed*dt/5);
        mat4.translate(refs.cameraMatrix, refs.cameraMatrix, vec3.fromValues(0, 0, -dt*refs.cameraSpeed));
        for (const highlight of refs.highlights) {
          if (refs.t > highlight.death) {
            // respawn new highlight
            const terrainSize: vec2 = vec2.fromValues(tilesWide*tileWidth, tilesLong*tileHeight);
            const theta: number = 2*Math.PI*Math.random();
            const pos: vec2 = vec2.fromValues(0, refs.cameraMatrix[14] - .5*terrainSize[1]);
            vec2.add(pos, pos, vec2.fromValues(terrainSize[0]*Math.cos(theta), terrainSize[1]*Math.sin(theta)));
            const target: vec2 = vec2.fromValues(
              refs.cameraMatrix[12] + (Math.random() - .5)*terrainSize[0]*.5,
              refs.cameraMatrix[14] - (Math.random()*.5 + .5)*terrainSize[1]
            );
            const velo: vec2 = vec2.create();
            vec2.sub(velo, target, pos);
            vec2.normalize(velo, velo);
            vec2.scale(velo, velo, 10*tileWidth*(1 + Math.random()));
            highlight.birth = refs.t + Math.random()*3;
            highlight.death = highlight.birth + Helpers.randomRange(10, 20);
            highlight.maxRadius = Helpers.randomRange(3, 10)*tileWidth;
            highlight.velo = velo;
            highlight.pos = pos;
          } else {
            // update position
            const posIncr: vec2 = vec2.create();
            vec2.scale(posIncr, highlight.velo, dt);
            vec2.add(highlight.pos, highlight.pos, posIncr);
            // update radius
            const funcX: number = (refs.t - highlight.birth)/(highlight.death - highlight.birth);
            const funcR: number = highlight.maxRadius;
            if (funcX < .8) {
              highlight.radius = funcR*(.75*funcX + .4);
            } else {
              highlight.radius = funcR*(5 - 5*funcX);
            }
          }
        }
        const rt: number = (refs.t % 12) / 12;
        const gt: number = ((refs.t + 4) % 12) / 12;
        const bt: number = ((refs.t + 8) % 12) / 12;
        const r: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(rt - .5) + 1.5)));
        const g: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(gt - .5) + 1.5)));
        const b: number = 50 + 205*(1 - Math.max(0, Math.min(1, -4*Math.abs(bt - .5) + 1.5)));
        refs.scaffoldColor = vec3.fromValues(r, g, b);
      }
    }; incrementPhys();
    const highlights: [vec2, number][] = [];
    for (const highlight of refs.highlights) {
      if (refs.t > highlight.birth && refs.t < highlight.death) {
        highlights.push([highlight.pos, highlight.radius]);
      }
    }
    const render = (): void => {
      WebGLServices2.renderTerrain({ camera: refs.cameraMatrix, FOVY, renderDis: tilesLong*tileHeight, 
        screenSize: vec2.fromValues(window.innerWidth, .9*window.innerHeight), highlights,
        highlightColor: refs.scaffoldColor, t: refs.t});
    }; render();
  }

  const canvWidth: number = appState.viewportSnappedSize.x;
  const canvHeight: number = appState.viewportSnappedSize.y - Math.max(60, .1*appState.viewportSnappedSize.x);
  const canvWidthAdj: number = appState.viewportSnappedSize.y / appState.viewportSnappedSize.x * canvWidth;
  return (
    <div id="terrain">
      <canvas 
        id="terrainCanvas" 
        ref={refs.canvas} 
        width={canvWidthAdj} 
        height={canvHeight} 
        style={{width: canvWidth, height: canvHeight}}
      >
      </canvas>
      { debugging && 
        <>
          <p id="debug0" style={{position: "absolute", top: "200px", left: "20px", zIndex: 2}}></p>
          <p id="debug1" style={{position: "absolute", top: "240px", left: "20px", zIndex: 2}}></p>
          <p id="debug2" style={{position: "absolute", top: "280px", left: "20px", zIndex: 2}}></p>
          <p id="debug3" style={{position: "absolute", top: "320px", left: "20px", zIndex: 2}}></p>
        </>
      }
    </div>
  );
}