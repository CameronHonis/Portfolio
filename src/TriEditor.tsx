import React from "react";
import { Tri } from "./models/Tri";
import { V2 } from "./models/V2";

export interface Refs {
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  mouseDown: boolean;
  viewportBB: [V2, V2];
  increment: number;
  isNegating: boolean;
  solidTri: Tri;
  negTri: Tri;
  vertexSelected: number;
}

export const initRefs: Refs = {
  canvas: React.createRef() as React.MutableRefObject<HTMLCanvasElement>,
  mouseDown: false,
  viewportBB: [new V2(-2,-2), new V2(8,8)],
  increment: .01,
  isNegating: true,
  solidTri: new Tri(new V2(0,0), new V2(0,3), new V2(3,0)),
  negTri: new Tri(new V2(.86,.35), new V2(1.82,.59), new V2(.31,1.61)),
  vertexSelected: -1,
}

export const TriEditor: React.FC = () => {

  let { current: refs } = React.useRef<Refs>(initRefs);

  React.useEffect(() => {
    render();
  },[]); //eslint-disable-line

  const pointToViewportSpace = (p: V2, viewportPixelSize: V2) => {
    return new V2(
      viewportPixelSize.x*(p.x - refs.viewportBB[0].x)/(refs.viewportBB[1].x - refs.viewportBB[0].x),
      viewportPixelSize.y*(1 - (p.y - refs.viewportBB[0].y)/(refs.viewportBB[1].y - refs.viewportBB[0].y))
    );
  }

  const viewportToPointSpace = (p: V2, viewportPixelSize: V2) => {
    return new V2(
      refs.viewportBB[0].x + p.x/viewportPixelSize.x*(refs.viewportBB[1].x - refs.viewportBB[0].x),
      (1 - p.y/viewportPixelSize.y)*(refs.viewportBB[1].y - refs.viewportBB[0].y) + refs.viewportBB[0].y
      // refs.viewportBB[0].y - p.y/window.innerHeight*(refs.viewportBB[1].y - refs.viewportBB[0].y) + refs.viewportBB[0].y
    );
  }

  const render = () => {
    console.log("render");
    const canv: HTMLCanvasElement = refs.canvas.current;
    const canvSize: V2 = new V2(window.innerWidth, window.innerHeight - .12*window.innerWidth);
    canv.style.width = canvSize.x + "px";
    canv.style.height = canvSize.y + "px";
    const ctx: CanvasRenderingContext2D | null = refs.canvas.current.getContext("2d");
    if (!ctx) { return; }
    ctx.clearRect(0, 0, canv.width,canv.height);
    const dpr: number = window.devicePixelRatio;
    const styledWidth: number = +getComputedStyle(canv).getPropertyValue("width").slice(0,-2);
    const styledHeight: number = +getComputedStyle(canv).getPropertyValue("height").slice(0,-2);
    canv.setAttribute("width", styledWidth*dpr + "px");
    canv.setAttribute("height", styledHeight*dpr + "px");
    ctx.beginPath();
    const solid0vs: V2 = pointToViewportSpace(refs.solidTri.p0, canvSize);
    const solid1vs: V2 = pointToViewportSpace(refs.solidTri.p1, canvSize);
    const solid2vs: V2 = pointToViewportSpace(refs.solidTri.p2, canvSize);
    const neg0vs: V2 = pointToViewportSpace(refs.negTri.p0, canvSize);
    const neg1vs: V2 = pointToViewportSpace(refs.negTri.p1, canvSize);
    const neg2vs: V2 = pointToViewportSpace(refs.negTri.p2, canvSize);
    ctx.moveTo(solid0vs.x, solid0vs.y);
    ctx.lineTo(solid1vs.x, solid1vs.y);
    ctx.lineTo(solid2vs.x, solid2vs.y);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(neg0vs.x, neg0vs.y);
    ctx.lineTo(neg1vs.x, neg1vs.y);
    ctx.lineTo(neg2vs.x, neg2vs.y);
    ctx.closePath();
    ctx.fillStyle = "rgb(255,100,150)";
    ctx.fill();
    if (refs.isNegating) {
      const unionTris: Tri[] = refs.solidTri.negate(refs.negTri);
      for (const unionTri of unionTris) {
        // const u0: V2 = pointToViewportSpace(unionTri.p0, canvSize);
        // const u1: V2 = pointToViewportSpace(unionTri.p1, canvSize);
        // const u2: V2 = pointToViewportSpace(unionTri.p2, canvSize);
        let u01angle: number = unionTri.p1.add(unionTri.p0.scale(-1)).originAngle();
        let u02angle: number = unionTri.p2.add(unionTri.p0.scale(-1)).originAngle();
        if (u01angle - u02angle > Math.PI) { u01angle -= 2*Math.PI; }
        if (u02angle - u01angle > Math.PI) { u02angle -= 2*Math.PI; }
        const u0angleDiff: number = Math.abs(u01angle - u02angle);
        const u0angle: number = u01angle*.5 + u02angle*.5;
        const u0indent: number = Math.min(.02/(Math.cos(u0angleDiff/2)*Math.tan(u0angleDiff/2)),
          .5*unionTri.p1.scale(.5).add(unionTri.p2.scale(.5)).add(unionTri.p0.scale(-1)).magnitude());
        const u0: V2 = pointToViewportSpace(unionTri.p0.add(new V2(Math.cos(u0angle), Math.sin(u0angle))
          .scale(u0indent)), canvSize);
        let u10angle: number = u01angle + Math.PI;
        let u12angle: number = unionTri.p2.add(unionTri.p1.scale(-1)).originAngle();
        if (u10angle - u12angle > Math.PI) { u10angle -= 2*Math.PI; }
        if (u12angle - u10angle > Math.PI) { u12angle -= 2*Math.PI; }
        const u1angle: number = u10angle*.5 + u12angle*.5;
        const u1angleDiff: number = Math.abs(u10angle - u12angle);
        const u1indent: number = Math.min(.02/(Math.cos(u1angleDiff/2)*Math.tan(u1angleDiff/2)),
          .5*unionTri.p0.scale(.5).add(unionTri.p2.scale(.5)).add(unionTri.p1.scale(-1)).magnitude());
        const u1: V2 = pointToViewportSpace(unionTri.p1.add(new V2(Math.cos(u1angle), Math.sin(u1angle))
          .scale(u1indent)), canvSize);
        let u20angle: number = u02angle + Math.PI;
        let u21angle: number = u12angle + Math.PI;
        if (u20angle - u21angle > Math.PI) { u20angle -= 2*Math.PI; }
        if (u21angle - u20angle > Math.PI) { u21angle -= 2*Math.PI; }
        const u2angle: number = u20angle*.5 + u21angle*.5;
        const u2angleDiff: number = Math.abs(u20angle - u21angle);
        const u2indent: number = Math.min(.02/(Math.cos(u2angleDiff/2)*Math.tan(u2angleDiff/2)),
          .5*unionTri.p0.scale(.5).add(unionTri.p1.scale(.5)).add(unionTri.p2.scale(-1)).magnitude());
        const u2: V2 = pointToViewportSpace(unionTri.p2.add(new V2(Math.cos(u2angle), Math.sin(u2angle))
          .scale(u2indent)), canvSize);
        // const u0: V2 = pointToViewportSpace(
        //   unionTri.p0.add(unionTri.p1.scale(.5).add(unionTri.p2.scale(.5)).add(unionTri.p0.scale(-1)).unit().scale(.1)),
        //   canvSize);
        // const u1: V2 = pointToViewportSpace(
        //   unionTri.p1.add(unionTri.p0.scale(.5).add(unionTri.p2.scale(.5)).add(unionTri.p1.scale(-1)).unit().scale(.1)),
        //   canvSize);
        // const u2: V2 = pointToViewportSpace(
        //   unionTri.p2.add(unionTri.p0.scale(.5).add(unionTri.p1.scale(.5)).add(unionTri.p2.scale(-1)).unit().scale(.1)),
        //   canvSize);
        // const u0: V2 = pointToViewportSpace(unionTri.p0.scale(.95)
        //   .add(unionTri.p1.scale(.025)).add(unionTri.p2.scale(.025)), canvSize);
        // const u1: V2 = pointToViewportSpace(unionTri.p1.scale(.95)
        //   .add(unionTri.p0.scale(.025)).add(unionTri.p2.scale(.025)), canvSize);
        // const u2: V2 = pointToViewportSpace(unionTri.p2.scale(.95)
        //   .add(unionTri.p0.scale(.025)).add(unionTri.p1.scale(.025)), canvSize);
        ctx.beginPath();
        ctx.moveTo(u0.x, u0.y);
        ctx.lineTo(u1.x, u1.y);
        ctx.lineTo(u2.x, u2.y);
        ctx.closePath();
        ctx.fillStyle = "rgb(200,200,200)";
        ctx.fill();
      }
    }
  }

  const mouseMove = (e: React.MouseEvent) => {
    if (refs.mouseDown && refs.vertexSelected >= 0) {
      const canvSize: V2 = new V2(window.innerWidth, window.innerHeight - .12*window.innerWidth);
      const mousePos: V2 = viewportToPointSpace(new V2(e.clientX, e.clientY - .12*window.innerWidth), canvSize);
      if (refs.vertexSelected === 0) {
        refs.solidTri = new Tri(mousePos, refs.solidTri.p1, refs.solidTri.p2);
      } else if (refs.vertexSelected === 1) {
        refs.solidTri = new Tri(refs.solidTri.p0, mousePos, refs.solidTri.p2);
      } else if (refs.vertexSelected === 2) {
        refs.solidTri = new Tri(refs.solidTri.p0, refs.solidTri.p1, mousePos);
      } else if (refs.vertexSelected === 3) {
        refs.negTri = new Tri(mousePos, refs.negTri.p1, refs.negTri.p2);
      } else if (refs.vertexSelected === 4) {
        refs.negTri = new Tri(refs.negTri.p0, mousePos, refs.negTri.p2);
      } else if (refs.vertexSelected === 5) {
        refs.negTri = new Tri(refs.negTri.p0, refs.negTri.p1, mousePos);
      }
      render();
    }
  }

  const mouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      refs.mouseDown = true;
      const canvSize: V2 = new V2(window.innerWidth, window.innerHeight - .12*window.innerWidth);
      const mousePos: V2 = viewportToPointSpace(new V2(e.clientX, e.clientY - .12*window.innerWidth), canvSize);
      let closestVertex: [number, number] = [0, mousePos.add(refs.solidTri.p0.scale(-1)).magnitude()]
      if (mousePos.add(refs.solidTri.p1.scale(-1)).magnitude() < closestVertex[1]) {
        closestVertex = [1, mousePos.add(refs.solidTri.p1.scale(-1)).magnitude()];
      }
      if (mousePos.add(refs.solidTri.p2.scale(-1)).magnitude() < closestVertex[1]) {
        closestVertex = [2, mousePos.add(refs.solidTri.p2.scale(-1)).magnitude()];
      }
      if (mousePos.add(refs.negTri.p0.scale(-1)).magnitude() < closestVertex[1]) {
        closestVertex = [3, mousePos.add(refs.negTri.p0.scale(-1)).magnitude()];
      }
      if (mousePos.add(refs.negTri.p1.scale(-1)).magnitude() < closestVertex[1]) {
        closestVertex = [4, mousePos.add(refs.negTri.p1.scale(-1)).magnitude()];
      }
      if (mousePos.add(refs.negTri.p2.scale(-1)).magnitude() < closestVertex[1]) {
        closestVertex = [5, mousePos.add(refs.negTri.p2.scale(-1)).magnitude()];
      }
      if (closestVertex[1] < 50) {
        refs.vertexSelected = closestVertex[0];
      } else {
        refs.vertexSelected = -1;
      }
    } else if (e.button === 1) {
      const canvSize: V2 = new V2(window.innerWidth, window.innerHeight - .12*window.innerWidth);
      console.log(viewportToPointSpace(new V2(e.clientX, e.clientY - .12*window.innerWidth), canvSize).toString());
    }
  }

  const mouseUp = (e: React.MouseEvent) => {
    refs.mouseDown = false;
    refs.vertexSelected = -1;
  }

  return(
    <div id="triEditor">
      <canvas ref={refs.canvas} 
        onMouseDown={e => mouseDown(e)} 
        onMouseMove={e => mouseMove(e)} 
        onMouseUp={e => mouseUp(e)}
      />
    </div>
  );
}