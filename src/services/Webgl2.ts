import { mat4, vec2, vec3 } from "gl-matrix";
import { ShaderData } from "./Webgl";
// @ts-ignore
import vs1 from "!raw-loader!../shaders/vertexShader1.glsl";
// @ts-ignore
import fs1 from "!raw-loader!../shaders/fragmentShader1.glsl";
// @ts-ignore
import vs2 from "!raw-loader!../shaders/vertexShader2.glsl";
// @ts-ignore
import fs2 from "!raw-loader!../shaders/fragmentShader2.glsl";
import edgecap from "../meshData/edgecap.json";
import vertexcap from "../meshData/vertexcap.json";
import { Helpers } from "./Helpers";

export const BASE_VERTEX_BYTES: number = 16;
export const HL_VERTEX_BYTES: number = 12;
export const HL_TILE_BYTES: number = 3384;

export interface ProgramData {
  gl: WebGLRenderingContext;
  maxWidth: number;
  maxHeight: number;
  tileHeight: number;
  lightPosition: vec3;
  fogStart: number;
  fogEnd: number;
  fogMin: number;
  fogMax: number;
  fogTransform: vec3;
  ambientLight: number;
  introAnimTime: number;
}

export interface SceneData {
  camera: mat4;
  FOVY: number;
  renderDis: number;
  screenSize: vec2;
  highlights: [vec2, number][];
  highlightColor: vec3;
  t: number;
}

export class WebGLServices2 {
  public static gl: WebGLRenderingContext;
  public static program: WebGLProgram;
  public static program2: WebGLProgram;
  public static terrainMaxWidth: number;
  public static terrainMaxHeight: number;
  public static terrainMaxVerts: number;
  public static terrainMaxTris: number;
  //actual byte idx = bytesPerVertex*nextVertexBufferIdx
  public static nextTileIdx: number = 0;
  public static baseVertexBuffer: WebGLBuffer;
  public static baseVertexBufferData: ArrayBuffer;
  public static highlightVertexBuffer: WebGLBuffer;
  public static highlightVertexBufferData: ArrayBuffer;

  static mat4Distance(a: mat4, b: mat4): number {
    const dx: number = a[13] - b[13];
    const dy: number = a[14] - b[14];
    const dz: number = a[15] - b[15];
    return vec3.length([dx, dy, dz]);
  }

  static calcNormal(base: vec3, left: vec3, right: vec3): vec3 {
    const baseLeft: vec3 = vec3.create();
    vec3.sub(baseLeft, left, base);
    const baseRight: vec3 = vec3.create();
    vec3.sub(baseRight, right, base);
    const normal: vec3 = vec3.create();
    vec3.cross(normal, baseRight, baseLeft);
    vec3.normalize(normal, normal);
    return normal;
  }

  static fitEdgecap(camPos: vec3, a: vec3, b: vec3, width: number=.35, vertexcapDiameter: number=1): [mat4, vec3] {
    const mid: vec3 = vec3.fromValues(.5*a[0] + .5*b[0], .5*a[1] + .5*b[1], .5*a[2] + .5*b[2]);
    const bToA: vec3 = vec3.create();
    vec3.sub(bToA, a, b);
    const upDir: vec3 = vec3.create();
    vec3.normalize(upDir, bToA);
    const rightDir: vec3 = vec3.create();
    vec3.cross(rightDir, [0, 1, 0], bToA);
    vec3.normalize(rightDir, rightDir);
    const lookDir: vec3 = vec3.create();
    vec3.cross(lookDir, upDir, rightDir);
    const clipDis: number = Math.sqrt(vertexcapDiameter*vertexcapDiameter - width*width);
    const scale: vec3 = vec3.fromValues(width, vec3.length(bToA) - clipDis, width);
    const mat: mat4 = mat4.fromValues(
      rightDir[0], rightDir[1], rightDir[2], 0,
      upDir[0], upDir[1], upDir[2], 0,
      lookDir[0], lookDir[1], lookDir[2], 0,
      mid[0], mid[1], mid[2], 1
    );
    return [mat, scale];
  }

  static fitVertexcap(camPos: vec3, pos: vec3): mat4 {
    const posToCam: vec3 = vec3.create();
    vec3.sub(posToCam, camPos, pos);
    vec3[2] = 0;
    const lookDir: vec3 = vec3.create();
    vec3.normalize(lookDir, posToCam);
    const rightDir: vec3 = vec3.create();
    vec3.cross(rightDir, lookDir, [0, 1, 0]);
    vec3.normalize(rightDir, rightDir);
    const upDir: vec3 = vec3.create();
    vec3.cross(upDir, lookDir, rightDir);
    const mat: mat4 = mat4.fromValues(
      rightDir[0], rightDir[1], rightDir[2], 0,
      upDir[0], upDir[1], upDir[2], 0,
      lookDir[0], lookDir[1], lookDir[2], 0,
      pos[0], pos[1], pos[2], 1
    );
    return mat;
  }

  static loadShader(gl: WebGLRenderingContext, shaderData: ShaderData): WebGLShader {
    const shader: WebGLShader = gl.createShader(shaderData.type) as WebGLShader;
    gl.shaderSource(shader, shaderData.source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("An error occurred while compiling shaders: " + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }
    return shader;
  }

  static initProgram({ gl, maxHeight, maxWidth, lightPosition, fogStart, fogEnd, fogMin, 
  fogMax, fogTransform, ambientLight, tileHeight, introAnimTime }: ProgramData): void {
    this.terrainMaxVerts = (maxWidth + 1)*(maxHeight + 1);
    this.terrainMaxTris = 2*maxWidth*maxHeight;
    this.gl = gl;
    this.terrainMaxWidth = maxWidth;
    this.terrainMaxHeight = maxHeight;
    this.baseVertexBufferData = new ArrayBuffer(BASE_VERTEX_BYTES*3*this.terrainMaxTris);
    this.highlightVertexBufferData = new ArrayBuffer(HL_TILE_BYTES*maxWidth*maxHeight);
    this.baseVertexBuffer = gl.createBuffer() as WebGLBuffer;
    this.highlightVertexBuffer = gl.createBuffer() as WebGLBuffer;
    const modelMatrix: mat4 = mat4.create();
    mat4.identity(modelMatrix);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);

    const program: WebGLProgram = gl.createProgram() as WebGLProgram;
    this.program = program;
    gl.attachShader(program, this.loadShader(gl, {type: gl.VERTEX_SHADER, source: vs1}));
    gl.attachShader(program, this.loadShader(gl, {type: gl.FRAGMENT_SHADER, source: fs1}));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    }
    
    gl.useProgram(program);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, modelMatrix);
    gl.uniform3fv(gl.getUniformLocation(program, "cameraLightPosition"), lightPosition);
    gl.uniform1f(gl.getUniformLocation(program, "fogStart"), fogStart);
    gl.uniform1f(gl.getUniformLocation(program, "fogEnd"), fogEnd);
    gl.uniform1f(gl.getUniformLocation(program, "fogMin"), fogMin);
    gl.uniform1f(gl.getUniformLocation(program, "fogMax"), fogMax);
    gl.uniform3fv(gl.getUniformLocation(program, "fogTransform"), fogTransform);
    gl.uniform1f(gl.getUniformLocation(program, "ambientLight"), ambientLight);
    gl.uniform1i(gl.getUniformLocation(program, "screenHeight"), gl.canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, "terrainLength"), maxHeight*tileHeight);
    gl.uniform1f(gl.getUniformLocation(program, "introAnimTime"), introAnimTime);

    const program2: WebGLProgram = gl.createProgram() as WebGLProgram;
    this.program2 = program2;
    gl.attachShader(program2, this.loadShader(gl, {type: gl.VERTEX_SHADER, source: vs2}));
    gl.attachShader(program2, this.loadShader(gl, {type: gl.FRAGMENT_SHADER, source: fs2}));
    gl.linkProgram(program2);
    if (!gl.getProgramParameter(program2, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(program2));
    }
    
    gl.useProgram(program2);
    gl.uniformMatrix4fv(gl.getUniformLocation(program2, "modelMatrix"), false, modelMatrix);
    gl.uniform1f(gl.getUniformLocation(program2, "fogStart"), fogStart);
    gl.uniform1f(gl.getUniformLocation(program2, "fogEnd"), fogEnd);
    gl.uniform1f(gl.getUniformLocation(program2, "fogMin"), fogMin);
    gl.uniform1f(gl.getUniformLocation(program2, "fogMax"), fogMax);
    gl.uniform3fv(gl.getUniformLocation(program2, "fogTransform"), fogTransform);
    gl.uniform1i(gl.getUniformLocation(program2, "screenHeight"), gl.canvas.height);
    gl.uniform1f(gl.getUniformLocation(program2, "terrainLength"), maxHeight*tileHeight);
    gl.uniform1f(gl.getUniformLocation(program2, "introAnimTime"), introAnimTime);
  }

  static renderTerrain({ camera, FOVY, renderDis, screenSize, highlights, highlightColor, t }: SceneData): void {
    const invCamera: mat4 = mat4.create();
    mat4.invert(invCamera, camera);
    const perspectiveMatrix: mat4 = mat4.create();
    mat4.perspective(
      perspectiveMatrix, 
      FOVY, 
      screenSize[0]/screenSize[1], 
      renderDis/10000, 
      renderDis
    );
    const projectionMatrix: mat4 = mat4.create();
    mat4.mul(projectionMatrix, perspectiveMatrix, invCamera);

    this.resetCanvas();
    { // draw base terrain (opaque unless in intro)
      this.gl.useProgram(this.program);
      this.gl.depthMask(true);
      if (t < 3) {
        this.gl.enable(this.gl.BLEND);
      } else {
        this.gl.disable(this.gl.BLEND);
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.baseVertexBuffer);
      const modelPositionLocation: number = this.gl.getAttribLocation(this.program, "modelPosition");
      this.gl.vertexAttribPointer(
        modelPositionLocation,
        3,
        this.gl.FLOAT,
        false,
        BASE_VERTEX_BYTES,
        0
      );
      this.gl.enableVertexAttribArray(modelPositionLocation);
      const modelNormalLocation: number = this.gl.getAttribLocation(this.program, "modelNormal");
      this.gl.vertexAttribPointer(
        modelNormalLocation,
        4,
        this.gl.BYTE,
        true,
        BASE_VERTEX_BYTES,
        12
      );
      this.gl.enableVertexAttribArray(modelNormalLocation);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "cameraMatrix"), false, camera);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "projectionMatrix"), false, projectionMatrix);
      this.gl.uniform1f(this.gl.getUniformLocation(this.program, "t"), t);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 3*this.terrainMaxTris);
    }
    { // draw highlight tris (variable opacity, draw order irrelevant)
      this.gl.useProgram(this.program2);
      this.gl.depthMask(false);
      this.gl.enable(this.gl.BLEND);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.highlightVertexBuffer);
      this.gl.blendEquation(this.gl.FUNC_ADD);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      const modelPositionLocation2: number = this.gl.getAttribLocation(this.program2, "modelPosition");
      this.gl.vertexAttribPointer(
        modelPositionLocation2,
        3,
        this.gl.FLOAT,
        false,
        12,
        0
      );
      this.gl.enableVertexAttribArray(modelPositionLocation2);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program2, "cameraMatrix"), false, camera);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program2, "projectionMatrix"), false, projectionMatrix);
      this.gl.uniform3fv(this.gl.getUniformLocation(this.program2, "highlightData0"), highlights.length > 0 ? 
        vec3.fromValues(highlights[0][0][0], highlights[0][0][1], highlights[0][1]) : vec3.create());
      // this.gl.uniform3fv(this.gl.getUniformLocation(this.program2, "highlightData0"), vec3.fromValues(0, -50, 50));
      this.gl.uniform3fv(this.gl.getUniformLocation(this.program2, "highlightData1"), highlights.length > 1 ?
        vec3.fromValues(highlights[1][0][0], highlights[1][0][1], highlights[1][1]) : vec3.create());
      this.gl.uniform3fv(this.gl.getUniformLocation(this.program2, "highlightData2"), highlights.length > 2 ?
        vec3.fromValues(highlights[2][0][0], highlights[2][0][1], highlights[2][1]) : vec3.create());
      this.gl.uniform3fv(this.gl.getUniformLocation(this.program2, "highlightColor"), highlightColor);
      this.gl.uniform1f(this.gl.getUniformLocation(this.program2, "t"), t);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.highlightVertexBufferData.byteLength/HL_VERTEX_BYTES);
      const debugger0: HTMLParagraphElement | null = document.querySelector("#debug0");

      if (debugger0) {
        if (highlights.length) {
          debugger0.textContent = "<" + Helpers.roundToPow(highlights[0][0][0]) + ", " + Helpers.roundToPow(highlights[0][0][1]) + ">"
            + "  " + highlights[0][1];
        } else {
          debugger0.textContent = highlights.length.toString();
        }
      }
    }
  }

  static resetCanvas(): void {
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clearDepth(1.0);
  }

  // sets data to render new tris in array buffer
  static addTerrainTile(stdPoss: vec2[], terrainPoss: {[index: string]: vec3}, camPos: vec3): void {
    const incrementTileIdx = (): void => {
      this.nextTileIdx++;
      this.nextTileIdx %= this.terrainMaxWidth*this.terrainMaxHeight;
    }
    // manip mock buffers
    for (const stdPos of stdPoss) {
      // console.log(stdPos);
      // set base tris
      const baseVertexBufferDV: DataView = new DataView(this.baseVertexBufferData);
      const diagHash: string = (stdPos[0] - 1) + " " + (stdPos[1] + 1);
      if (diagHash in terrainPoss) {
        const diag: vec3 = terrainPoss[diagHash];
        const posHash: string = stdPos[0] + " " + stdPos[1];
        const pos: vec3 = terrainPoss[posHash];
        const leftHash: string = (stdPos[0] - 1) + " " + stdPos[1];
        const left: vec3 = terrainPoss[leftHash];
        const backHash: string = stdPos[0] + " " + (stdPos[1] + 1);
        const back: vec3 = terrainPoss[backHash];
        if (!left) console.log(leftHash, pos, {...terrainPoss});
        if (!diag) console.log(diagHash, pos, {...terrainPoss});
        if (!back) debugger;
        if (!pos) console.log(posHash, pos, {...terrainPoss});
        const leftNormal: vec3 = this.calcNormal(left, pos, diag);
        const backNormal: vec3 = this.calcNormal(back, diag, pos);
        const baseTrisData: [vec3, vec3, vec3, vec3][] = [
          [left, diag, pos, leftNormal],
          [back, pos, diag, backNormal]
        ];
        for (let i = 0; i < 2; ++i) {
          for (let j = 0; j < 3; ++j) {
            const byteIdx: number = BASE_VERTEX_BYTES*(6*this.nextTileIdx + 3*i + j);
            baseVertexBufferDV.setFloat32(byteIdx, baseTrisData[i][j][0], true);
            baseVertexBufferDV.setFloat32(byteIdx + 4, baseTrisData[i][j][1], true);
            baseVertexBufferDV.setFloat32(byteIdx + 8, baseTrisData[i][j][2], true);
            baseVertexBufferDV.setInt8(byteIdx + 12, baseTrisData[i][3][0]*0x7F);
            baseVertexBufferDV.setInt8(byteIdx + 13, baseTrisData[i][3][1]*0x7F);
            baseVertexBufferDV.setInt8(byteIdx + 14, baseTrisData[i][3][2]*0x7F);
          }
        }
        // set highlight tris
        const HLVertexBufferDV: DataView = new DataView(this.highlightVertexBufferData);
        const [ leftEdgeMatrix, leftEdgeScale ]: [mat4, vec3] = this.fitEdgecap(camPos, left, pos);
        const [ diagEdgeMatrix, diagEdgeScale ]: [mat4, vec3] = this.fitEdgecap(camPos, diag, pos);
        const [ backEdgeMatrix, backEdgeScale ]: [mat4, vec3] = this.fitEdgecap(camPos, back, pos);
        const HLTileByteIdx: number = HL_TILE_BYTES*this.nextTileIdx;
        // left edgecap
        for (let i = 0; i < edgecap.faces.length; ++i) {
          for (let j = 0; j < 3; ++j) {
            const byteIdx: number = HLTileByteIdx + HL_VERTEX_BYTES*(i*3 + j);
            const modelPos: vec3 = vec3.create();
            vec3.copy(modelPos, edgecap.vertices[edgecap.faces[i][j]] as vec3);
            vec3.mul(modelPos, modelPos, leftEdgeScale);
            const edgecapPos: vec3 = vec3.create();
            vec3.transformMat4(edgecapPos, modelPos, leftEdgeMatrix);
            HLVertexBufferDV.setFloat32(byteIdx, edgecapPos[0], true);
            HLVertexBufferDV.setFloat32(byteIdx + 4, edgecapPos[1], true);
            HLVertexBufferDV.setFloat32(byteIdx + 8, edgecapPos[2], true);
          }
        }
        // diag edgecap
        for (let i = 0; i < edgecap.faces.length; ++i) {
          for (let j = 0; j < 3; ++j) {
            const byteIdx: number = HLTileByteIdx + HL_VERTEX_BYTES*(3*i + j + 3*edgecap.faces.length);
            const modelPos: vec3 = vec3.create();
            vec3.copy(modelPos, edgecap.vertices[edgecap.faces[i][j]] as vec3);
            vec3.mul(modelPos, modelPos, diagEdgeScale);
            const edgecapPos: vec3 = vec3.create();
            vec3.transformMat4(edgecapPos, modelPos, diagEdgeMatrix);
            HLVertexBufferDV.setFloat32(byteIdx, edgecapPos[0], true);
            HLVertexBufferDV.setFloat32(byteIdx + 4, edgecapPos[1], true);
            HLVertexBufferDV.setFloat32(byteIdx + 8, edgecapPos[2], true);
          }
        }
        // back edgecap
        for (let i = 0; i < edgecap.faces.length; ++i) {
          for (let j = 0; j < 3; ++j) {
            const byteIdx: number = HLTileByteIdx + HL_VERTEX_BYTES*(3*i + j + 6*edgecap.faces.length);
            const modelPos: vec3 = vec3.create();
            vec3.copy(modelPos, edgecap.vertices[edgecap.faces[i][j]] as vec3);
            vec3.mul(modelPos, modelPos, backEdgeScale);
            const edgecapPos: vec3 = vec3.create();
            vec3.transformMat4(edgecapPos, modelPos, backEdgeMatrix);
            HLVertexBufferDV.setFloat32(byteIdx, edgecapPos[0], true);
            HLVertexBufferDV.setFloat32(byteIdx + 4, edgecapPos[1], true);
            HLVertexBufferDV.setFloat32(byteIdx + 8, edgecapPos[2], true);
          }
        }
        // vertexcap
        const vertexcapMatrix: mat4 = this.fitVertexcap(camPos, pos);
        const vertexcapScale: vec3 = vec3.fromValues(1, 1, 1);
        for (let i = 0; i < vertexcap.faces.length; ++i) {
          for (let j = 0; j < 3; ++j) {
            const byteIdx: number = HLTileByteIdx + HL_VERTEX_BYTES*(3*i + j + 9*edgecap.faces.length);
            const modelPos: vec3 = vec3.create();
            vec3.copy(modelPos, vertexcap.vertices[vertexcap.faces[i][j]] as vec3);
            vec3.mul(modelPos, modelPos, vertexcapScale);
            const vertexcapPos: vec3 = vec3.create();
            vec3.transformMat4(vertexcapPos, modelPos, vertexcapMatrix);
            HLVertexBufferDV.setFloat32(byteIdx, vertexcapPos[0], true);
            HLVertexBufferDV.setFloat32(byteIdx + 4, vertexcapPos[1], true);
            HLVertexBufferDV.setFloat32(byteIdx + 8, vertexcapPos[2], true);
          }
        }
        // increment mem pointer
        incrementTileIdx();
      }
    }

    // // update real buffers
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.baseVertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.baseVertexBufferData, this.gl.DYNAMIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.highlightVertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.highlightVertexBufferData, this.gl.DYNAMIC_DRAW);
  }
}