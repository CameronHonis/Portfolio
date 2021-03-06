import { mat4, vec3 } from "gl-matrix";
import { Triangle } from "../models/Triangle";
import { Mesh } from "../models/Mesh";
import { EdgeCap } from "../models/EdgeCap";

export interface GLScene {
  gl: WebGLRenderingContext;
  terrainMesh: Mesh;
  transparentMeshes: Mesh[];
  cameraMatrix: mat4;
  lightPosition: vec3;
  renderDis: number;
  fogStart: number;
  fogEnd: number;
  fogMin: number;
  fogMax: number;
  fogTransform: [number, number, number];
}

export interface ShaderData {
  type: number;
  source: string;
}

export interface BufferData {
  name: string;
  type: number; // enum ex. gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER
  data: Float32Array | Uint16Array;
  program: WebGLProgram;
  entrySize: number;
  valueType: number; // enum ex. gl.FLOAT
  entryStride: number;
  entryOffset: number;
}

export class WebGLServices {
  static mat4(): mat4
  static mat4(x: number, y: number, z: number): mat4
  static mat4(v3: vec3): mat4
  static mat4(...args: any): mat4 {
    let pos: vec3;
    if (!args[0]) {
      pos = vec3.create();
    } else if (args[0] instanceof Float32Array) {
      pos = args[0] as vec3;
    } else if (typeof args[0] === "number" && typeof args[1] === "number" && typeof args[2] === "number"){
      pos = vec3.fromValues(args[0], args[1], args[2]);
    } else {
      throw new Error();
    }
    const rtn: mat4 = mat4.create();
    mat4.identity(rtn);
    mat4.translate(rtn, rtn, pos);
    return rtn;
  }

  static mat4distances(a: mat4, b: mat4): number {
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

  static attachEdgecap(edgecap: EdgeCap, a: vec3, b: vec3, width: number=1): void {
    const mid: vec3 = vec3.fromValues(a[0]*.5 + b[0]*.5, a[1]*.5 + b[1]*.5, a[2]*.5 + b[2]*.5);
    const upDir: vec3 = vec3.create(); 
    vec3.sub(upDir, a, b);
    const dis: number = vec3.length(upDir);
    vec3.normalize(upDir, upDir);
    const lookDir: vec3 = vec3.create();
    vec3.cross(lookDir, upDir, [0, 1, 0]);
    vec3.normalize(lookDir, lookDir);
    const rightDir: vec3 = vec3.create();
    vec3.cross(rightDir, upDir, lookDir);
    edgecap.matrix = mat4.fromValues(rightDir[0], rightDir[1], rightDir[2], 0, upDir[0], upDir[1], upDir[2], 0, lookDir[0], lookDir[1], lookDir[2], 0, mid[0], mid[1], mid[2], 1);
    const disSub: number = Math.sqrt(1 - width*width); // assumes connecting sphere radii === 1
    edgecap.axesScale = [width, dis - disSub, width];
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

  static createProgramWithShaders(gl: WebGLRenderingContext, shaders: ShaderData[]): WebGLProgram {
    const program: WebGLProgram = gl.createProgram() as WebGLProgram;
    for (const shader of shaders) {
      gl.attachShader(program, this.loadShader(gl, shader));
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    }
    return program;
  }

  static initBuffer(gl: WebGLRenderingContext, bufferData: BufferData): WebGLBuffer {
    const buffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(bufferData.type, buffer);
    gl.bufferData(bufferData.type, bufferData.data, gl.STATIC_DRAW);
    const bufferLocation: number = gl.getAttribLocation(bufferData.program, bufferData.name);
    gl.vertexAttribPointer(
      bufferLocation,
      bufferData.entrySize,
      bufferData.valueType,
      false,
      bufferData.entryStride,
      bufferData.entryOffset,
    );
    gl.enableVertexAttribArray(bufferLocation);
    return buffer;
  }

  static initProgramData(
    gl: WebGLRenderingContext, 
    mesh: Mesh, 
    camera: mat4, 
    projectionMatrix: mat4, 
    lightPosition: vec3, 
    fogStart: number, 
    fogEnd: number, 
    fogMin: number, 
    fogMax: number,
    fogTransform: [number, number, number],
  ): void {
    // buffers
    const posBufferData: BufferData = {
      name: "modelVertexPosition",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*9),
      program: mesh.shaderProgram,
      entrySize: 3,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    };
    const colorBufferData: BufferData = {
      name: "vertexColor",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*12),
      program: mesh.shaderProgram,
      entrySize: 4,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    };
    const normalBufferData: BufferData = {
      name: "modelVertexNormal",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*9),
      program: mesh.shaderProgram,
      entrySize: 3,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    };
    const overrideMatrixRVBufferData: BufferData = {
      name: "overrideMatrixRV",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*12),
      program: mesh.shaderProgram,
      entrySize: 4,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    };
    const overrideMatrixUVBufferData: BufferData = {
      name: "overrideMatrixUV",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*12),
      program: mesh.shaderProgram,
      entrySize: 4,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    };
    const overrideMatrixLVBufferData: BufferData = {
      name: "overrideMatrixLV",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*12),
      program: mesh.shaderProgram,
      entrySize: 4,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    };
    const overrideMatrixPosBufferData: BufferData = {
      name: "overrideMatrixPos",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*12),
      program: mesh.shaderProgram,
      entrySize: 4,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    };
    const overrideModelData: BufferData = {
      name: "overrideModelData",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*3),
      program: mesh.shaderProgram,
      entrySize: 1,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    };
    const overrideScale: BufferData = {
      name: "overrideScale",
      type: gl.ARRAY_BUFFER,
      data: new Float32Array(mesh.triangles.length*9),
      program: mesh.shaderProgram,
      entrySize: 3,
      valueType: gl.FLOAT,
      entryStride: 0,
      entryOffset: 0,
    }
    for (let i = 0; i < mesh.triangles.length; ++i) {
      const tri: Triangle = mesh.triangles[i];
      const posDataExtd: number[] = [tri.p0.x, tri.p0.y, tri.p0.z, tri.p1.x, tri.p1.y, tri.p1.z, tri.p2.x, tri.p2.y, tri.p2.z];
      const colorDataExtd: number[] = [tri.p0.r, tri.p0.g, tri.p0.b, tri.p0.a, tri.p1.r, tri.p1.g, tri.p1.b, tri.p1.a, tri.p2.r, 
        tri.p2.g, tri.p2.b, tri.p2.a];
      const normalDataExtd: (number | undefined)[] = [tri.p0.normalx, tri.p0.normaly, tri.p0.normalz, tri.p1.normalx, 
        tri.p1.normaly, tri.p1.normalz, tri.p2.normalx, tri.p2.normaly, tri.p2.normalz];
      let overrideMatrixRVExtd: number[] | undefined = undefined;
      let overrideMatrixUVExtd: number[] | undefined = undefined;
      let overrideMatrixLVExtd: number[] | undefined = undefined;
      let overrideMatrixPosExtd: number[] | undefined = undefined;
      let overrideScaleExtd: number[] | undefined = undefined;
      const toOverrideData: boolean = !!(tri.p0.modelMatrix);
      if (toOverrideData) {
        const p0m: mat4 = tri.p0.modelMatrix!;
        const p1m: mat4 = tri.p1.modelMatrix!;
        const p2m: mat4 = tri.p2.modelMatrix!;
        overrideMatrixRVExtd = [
          p0m[0], p0m[1], p0m[2], p0m[3],
          p1m[0], p1m[1], p1m[2], p1m[3],
          p2m[0], p2m[1], p2m[2], p2m[3],
        ];
        overrideMatrixUVExtd = [
          p0m[4], p0m[5], p0m[6], p0m[7],
          p1m[4], p1m[5], p1m[6], p1m[7],
          p2m[4], p2m[5], p2m[6], p2m[7],
        ];
        overrideMatrixLVExtd = [
          p0m[8], p0m[9], p0m[10], p0m[11],
          p1m[8], p1m[9], p1m[10], p1m[11],
          p2m[8], p2m[9], p2m[10], p2m[11],
        ];
        overrideMatrixPosExtd = [
          p0m[12], p0m[13], p0m[14], p0m[15],
          p1m[12], p1m[13], p1m[14], p1m[15],
          p2m[12], p2m[13], p2m[14], p2m[15],
        ];
        overrideScaleExtd = [
          tri.p0.modelScale![0], tri.p0.modelScale![1], tri.p0.modelScale![2],
          tri.p1.modelScale![0], tri.p1.modelScale![1], tri.p1.modelScale![2],
          tri.p2.modelScale![0], tri.p2.modelScale![1], tri.p2.modelScale![2],
        ];
      }
      for (let k = 0; k < 12; ++k) {
        if (k < 3) {
          overrideModelData.data[3*i + k] = toOverrideData ? 1 : 0;
        }
        if (k < 9) {
          posBufferData.data[9*i + k] = posDataExtd[k];
          if (!mesh.shadeSmooth && normalDataExtd[k]) {
            normalBufferData.data[9*i + k] = normalDataExtd[k]!;
          }
          if (toOverrideData) {
            overrideScale.data[9*i + k] = overrideScaleExtd![k];
          }
        }
        if (k < 12) {
          colorBufferData.data[12*i + k] = colorDataExtd[k];
          if (toOverrideData) {
            overrideMatrixRVBufferData.data[12*i + k] = overrideMatrixRVExtd![k];
            overrideMatrixUVBufferData.data[12*i + k] = overrideMatrixUVExtd![k];
            overrideMatrixLVBufferData.data[12*i + k] = overrideMatrixLVExtd![k];
            overrideMatrixPosBufferData.data[12*i + k] = overrideMatrixPosExtd![k];
          }
        }
      }
    }
    this.initBuffer(gl, posBufferData);
    this.initBuffer(gl, colorBufferData);
    if (!mesh.shadeSmooth) {
      this.initBuffer(gl, normalBufferData);
    }
    this.initBuffer(gl, overrideModelData);
    if (overrideMatrixLVBufferData.data.length) {
      this.initBuffer(gl, overrideMatrixRVBufferData);
      this.initBuffer(gl, overrideMatrixUVBufferData);
      this.initBuffer(gl, overrideMatrixLVBufferData);
      this.initBuffer(gl, overrideMatrixPosBufferData);
      this.initBuffer(gl, overrideScale);
    }
    // index buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indexArray: number[] = [];
    for (let i = 0; i < mesh.triangles.length*9; ++i) {
      indexArray.push(i);
    }
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
    // useProgram
    gl.useProgram(mesh.shaderProgram);
    // uniforms
    gl.uniformMatrix4fv(
      gl.getUniformLocation(mesh.shaderProgram, "modelMatrix"),
      false,
      mesh.matrix
    );
    gl.uniformMatrix4fv(
      gl.getUniformLocation(mesh.shaderProgram, "cameraMatrix"),
      false,
      camera
    );
    gl.uniformMatrix4fv(
      gl.getUniformLocation(mesh.shaderProgram, "projectionMatrix"),
      false,
      projectionMatrix,
    );
    gl.uniform3fv(
      gl.getUniformLocation(mesh.shaderProgram, "lightPosition"),
      lightPosition
    );
    gl.uniform1i(
      gl.getUniformLocation(mesh.shaderProgram, "shadeSmooth"),
      mesh.shadeSmooth ? 1 : 0
    );
    gl.uniform1f(
      gl.getUniformLocation(mesh.shaderProgram, "fogStart"),
      fogStart
    )
    gl.uniform1f(
      gl.getUniformLocation(mesh.shaderProgram, "fogEnd"),
      fogEnd
    );
    gl.uniform1f(
      gl.getUniformLocation(mesh.shaderProgram, "fogMin"),
      fogMin
    );
    gl.uniform1f(
      gl.getUniformLocation(mesh.shaderProgram, "fogMax"),
      fogMax
    );
    gl.uniform3fv(
      gl.getUniformLocation(mesh.shaderProgram, "fogTransform"),
      // new Float32Array([0, 2, -1])
      fogTransform
    );
    gl.uniform1f(
      gl.getUniformLocation(mesh.shaderProgram, "ambientLight"),
      mesh.ambientLight
    );
    gl.uniform3fv(
      gl.getUniformLocation(mesh.shaderProgram, "axesScale"),
      mesh.axesScale
    );
    gl.uniform1i(
      gl.getUniformLocation(mesh.shaderProgram, "screenHeight"),
      gl.canvas.height
    );
  }

  static drawMeshToCanvas(
    gl: WebGLRenderingContext, 
    mesh: Mesh, 
    camera: mat4, 
    projectionMatrix: mat4, 
    lightPosition: vec3, 
    fogStart: number, 
    fogEnd: number, 
    fogMin: number, 
    fogMax: number,
    fogTransform: [number, number, number],
  ): void {
    this.initProgramData(gl, mesh, camera, projectionMatrix, lightPosition, fogStart, fogEnd, fogMin, fogMax, fogTransform);
    gl.drawElements(gl.TRIANGLES, mesh.triangles.length*3, gl.UNSIGNED_SHORT, 0);
  }

  static renderScene({ gl, terrainMesh, transparentMeshes, cameraMatrix, renderDis, lightPosition, fogStart, fogEnd, fogMin, fogMax, fogTransform }: GLScene): void {
    const cameraInverse: mat4 = mat4.create();
    mat4.invert(cameraInverse, cameraMatrix);
    const perspectiveMatrix: mat4 = mat4.create();
    mat4.perspective(perspectiveMatrix, 90*Math.PI/180, window.innerWidth/window.innerHeight, 1, renderDis);
    const projectionMatrix: mat4 = mat4.create();
    mat4.mul(projectionMatrix, perspectiveMatrix, cameraInverse);
    WebGLServices.resetCanvas(gl);
    // gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    WebGLServices.drawMeshToCanvas(gl, terrainMesh, cameraMatrix, projectionMatrix, lightPosition, fogStart, fogEnd, fogMin, fogMax, fogTransform);
    // gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.sortMeshesByDistance(transparentMeshes, cameraMatrix);
    
    if (transparentMeshes.length > 0) {
      const transparentMeshAll: Mesh = new Mesh({ shaderProgram: transparentMeshes[0].shaderProgram, ambientLight: transparentMeshes[0].ambientLight });
      for (const transparentMesh of transparentMeshes) {
        for (const tri of transparentMesh.triangles) {
          if (tri.p0.a || tri.p1.a || tri.p2.a) {
            transparentMeshAll.triangles.push(tri);
          }
        }
      }
      const debug2: HTMLParagraphElement | null = document.querySelector("#debug2");
      if (debug2) {
        debug2.textContent = transparentMeshAll.triangles.length + " rendered";
      }
      WebGLServices.drawMeshToCanvas(gl, transparentMeshAll, cameraMatrix, projectionMatrix, lightPosition, fogStart, fogEnd, fogMin, fogMax, fogTransform);
    }
  }

  static resetCanvas(gl: WebGLRenderingContext): void {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  static sortMeshesByDistance(meshes: Mesh[], cameraMatrix: mat4): void {
    // directly mutates mesh array
    // calc all mesh diss
    const diss: number[] = [];
    for (const mesh of meshes) {
      diss.push(this.mat4distances(mesh.matrix, cameraMatrix));
    }
    // insertion sort
    // sorts distance from camera, furthest to closest
    // faster runtime on avg compared to other sorts assuming meshes are roughly sorted
    // each iteration. aka scene layout doesnt change much between render frames.
    let pointer: number = 1;
    while (pointer < meshes.length) {
      let pointer0: number = pointer - 1;
      while (pointer0 >= 0 && diss[pointer0+1] > diss[pointer0]) {
        // swap meshes in array
        const temp: Mesh = meshes[pointer0];
        meshes[pointer0] = meshes[pointer0+1];
        meshes[pointer0+1] = temp;
        // set idx pointers for meshes in new positions
        meshes[pointer0].worldArrayIdx = pointer0;
        meshes[pointer0+1].worldArrayIdx = pointer0+1;
        // swap internal diss array to match new mesh positions
        const temp0: number = diss[pointer0];
        diss[pointer0] = diss[pointer0+1];
        diss[pointer0+1] = temp0;
        pointer0--;
      }
      pointer++;
    }
  }
}