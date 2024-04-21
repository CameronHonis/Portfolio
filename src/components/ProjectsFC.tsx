import React from "react";
import gsap from "gsap";
import { AppState, AppStateAction } from "../App";
import { V2 } from "../models/V2";
import { V3 } from "../models/V3";
import { Circle1 } from "../svgComps/Circle1";
import { Circle2 } from "../svgComps/Circle2";
import { Circle3 } from "../svgComps/Circle3";
import { Circle4 } from "../svgComps/Circle4";
import { ProjectScreen } from "./ProjectScreen";
import { SelectCircle } from "../svgComps/SelectCircle";
import { ProjectAnnotations } from "./ProjectAnnotations";
import { Arrow } from "./ProjectArrow";
import { Helpers } from "../services/Helpers";
import {Projects} from "../models/Projects";

type TweenData = [inCoeff: number, inOffset: number, outCoeff: number, outOffset: number];

const introTerrainAnimDuration: number = 4;
const ringsRadiusTweenData: TweenData = [0, 2, 3, .2];
const ringsAngleTweenData: TweenData = [.5, .5, .5, .5];
const screenLengthTweenData: TweenData = [1, 1.5, 2, .5];
const selectCirclesCount: number = 3;

export interface Props {
  appState: AppState;
  appStateDispatch: React.Dispatch<AppStateAction>;
}

export interface RingRef {
  ref: React.MutableRefObject<SVGSVGElement>;
  radius: number;
  radiusTargets: [number, number][];
  angle: number;
  angleTargets: [number, number][]; // [angle, weight] idx0=nativeAngle idx1=cursorBased
  opacity: number;
  color: V3;
}

export interface ProjectScreenRef {
  ref: React.MutableRefObject<SVGSVGElement>;
  length: number;
  lengthTargets: [number,number][];
}

export interface SelectCircleRef {
  ref: React.MutableRefObject<HTMLDivElement>;
}

export interface AnnotationRef {
  circleRef: React.MutableRefObject<SVGEllipseElement>;
  lineRef: React.MutableRefObject<SVGPathElement>;
  textRef: React.MutableRefObject<HTMLParagraphElement>;
  lineStart: V2;
  lineBend: V2;
  lineEndRelProjectScreen: V2;
  text: string;
}

export interface Refs {
  t: number;
  opacities: [number, number, number]; // 0: svgshapes, 1: text, 2: screen
  mainDivRefs: [React.MutableRefObject<HTMLDivElement>, React.MutableRefObject<HTMLDivElement>, React.MutableRefObject<HTMLDivElement>];
  rings: RingRef[];
  projectScreen: ProjectScreenRef;
  annotations: AnnotationRef[];
  projectAnnotation: React.MutableRefObject<HTMLParagraphElement>;
  debug0: React.MutableRefObject<HTMLParagraphElement>;
  debug1: React.MutableRefObject<HTMLParagraphElement>;
}

export const initRefs: Refs = {
  t: 0,
  opacities: [0, 0, 0],
  mainDivRefs: [
    React.createRef() as React.MutableRefObject<HTMLDivElement>, 
    React.createRef() as React.MutableRefObject<HTMLDivElement>,
    React.createRef() as React.MutableRefObject<HTMLDivElement>,
  ],
  rings: [
    {
      ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
      radius: 0,
      radiusTargets: [[0,1],[0,0]],
      angle: 0,
      angleTargets: [[0, 1], [5*Math.PI/3, 0]],
      opacity: .25,
      color: new V3(255,255,255),
    },
    {
      ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
      radius: 0,
      radiusTargets: [[0,1],[0,0]],
      angle: 0,
      angleTargets: [[0, 1], [Math.PI, 0]],
      opacity: .25,
      color: new V3(255,255,255),
    },
    {
      ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
      radius: 0,
      radiusTargets: [[0,1],[0,0]],
      angle: 0,
      angleTargets: [[0, 1], [Math.PI/4, 0]],
      opacity: .25,
      color: new V3(255,255,255),
    },
    {
      ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
      radius: 0,
      radiusTargets: [[0,1],[0,0]],
      angle: 0,
      angleTargets: [[0, 1], [-Math.PI/2, 0]],
      opacity: .25,
      color: new V3(255,255,255),
    }
  ],
  projectScreen: {
    ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
    length: 0,
    lengthTargets: [[.5, 1], [.7, 0]],
  },
  annotations: [],
  projectAnnotation: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
  debug0: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
  debug1: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
}

export interface State {
  projectIndex: number;
}

export const initState: State = {
  projectIndex: 0,

}

export const ProjectsFC: React.FC<Props> = ({ appState, appStateDispatch }) => {

  const [ state, setState ] = React.useState<State>(initState); //eslint-disable-line
  let { current: refs } = React.useRef<Refs>(initRefs);

  React.useEffect(() => {
    // ring inits
    for (const ring of refs.rings) {
      ring.radius = 0;
      ring.ref.current.style.width = "0";
      ring.ref.current.style.height = "0";
    }
    refs.projectScreen.length = 0;
    refs.projectScreen.ref.current.style.width = "0";
    if (refs.t) { return; }
    const uiClock = (t0: number, t1: number) => {
      const dt: number = (t1 - t0)/1000;
      refs.t += dt;
      setTargets();
      tweens(dt);
      render();
      window.requestAnimationFrame(t2 => uiClock(t1, t2));
    }
    window.requestAnimationFrame(t0 => uiClock(t0, t0));
    document.addEventListener("mousemove", (e: MouseEvent) => {
      const widthHeightRatio: number = appState.viewportSnappedSize.x/appState.viewportSnappedSize.y;
      if (widthHeightRatio > 1.5) {
        const maxShift: number = .05*Math.max(window.innerWidth, window.innerHeight);
        const headerHeight: number = .1*window.innerHeight;
        const bodyHeight: number = window.innerHeight - headerHeight;
        const baseTop: number = headerHeight + .5*bodyHeight;
        const baseLeft: number = .5*window.innerWidth;
        const maxMouseDis: number = .5*Math.sqrt(window.innerWidth*window.innerWidth + window.innerHeight*window.innerHeight);
        const currMouseDisX: number = e.clientX - .5*window.innerWidth;
        const currMouseDisY: number = e.clientY - .5*window.innerHeight;
        const currMouseDis: number = Math.sqrt(currMouseDisX*currMouseDisX + currMouseDisY*currMouseDisY);
        const relMouseDis: number = currMouseDis / maxMouseDis;
        const currMouseAngle: number = Math.atan2(currMouseDisY, currMouseDisX);
        const shiftX: number = maxShift*relMouseDis*Math.cos(currMouseAngle);
        const shiftY: number = maxShift*relMouseDis*Math.sin(currMouseAngle);
        if (refs.rings[0].ref.current) {
          refs.rings[0].ref.current.style.left = baseLeft + .75*shiftX + "px";
          refs.rings[0].ref.current.style.top = baseTop + .75*shiftY + "px";
        }
        if (refs.rings[1].ref.current) {
          refs.rings[1].ref.current.style.left = baseLeft + .2*shiftX + "px";
          refs.rings[1].ref.current.style.top = baseTop + .2*shiftY + "px";
        }
        if (refs.rings[2].ref.current) {
          refs.rings[2].ref.current.style.left = baseLeft + shiftX + "px";
          refs.rings[2].ref.current.style.top = baseTop + shiftY + "px";
        }
        if (refs.rings[3].ref.current) {
          refs.rings[3].ref.current.style.left = baseLeft + 0*shiftX + "px";
          refs.rings[3].ref.current.style.top = baseTop + 0*shiftY + "px";
        }
      }
    });
    // opacities
    setTimeout(() => {
      // shapes opacity
      refs.opacities[0] = 1;
    }, introTerrainAnimDuration*1000);
    setTimeout(() => {
      // screen opacity
      refs.opacities[2] = 1;
    }, introTerrainAnimDuration*1000 + 500);
    const flicker = (times: number) => {
      for (let i = 0; i < times; ++i) {
        setTimeout(() => {
          refs.opacities[1] = 0;
          setTimeout(() => {
            refs.opacities[1] = 1;
          },120);
        },200*(i+1)*i + 50);
      }
    }
    setTimeout(() => {
      // text opacity
      refs.opacities[1] = 1;
      if (!refs.projectAnnotation.current) { return; }
      refs.projectAnnotation.current.style.opacity = "1";
      gsap.killTweensOf(refs.projectAnnotation.current, "opacity");
      gsap.to(refs.projectAnnotation.current, {opacity: 0, duration: 2, delay: 2});
      flicker(2);
      setTimeout(() => {
        flickerClock();
      },3000);
    }, introTerrainAnimDuration*1000 + 1500);
    const flickerClock = () => {
      const flickerCount: number = Math.floor(Math.random()*4);
      flicker(flickerCount);
      
      setTimeout(() => {
        flickerClock();
      },Math.random()*20000);
    }
  },[]); //eslint-disable-line

  React.useEffect(() => {
    if (!refs.projectAnnotation.current) { return; }
    refs.projectAnnotation.current.style.opacity = "1";
    gsap.killTweensOf(refs.projectAnnotation.current, "opacity");
    gsap.to(refs.projectAnnotation.current, {opacity: 0, duration: 2, delay: 2});
    refs.projectScreen.length = 0;
  },[state.projectIndex]); //eslint-disable-line

  React.useEffect(() => {
    const widthHeightRatio: number = appState.viewportSnappedSize.x/appState.viewportSnappedSize.y;
    if (widthHeightRatio > 1.5) {
      refs.rings[0].radiusTargets[0][0] = .42;
      refs.rings[0].radiusTargets[1][0] = .6;
      refs.rings[1].radiusTargets[0][0] = .3;
      refs.rings[1].radiusTargets[1][0] = .45;
      refs.rings[2].radiusTargets[0][0] = .6;
      refs.rings[2].radiusTargets[1][0] = .8;
      refs.rings[3].radiusTargets[0][0] = .2;
      refs.rings[3].radiusTargets[1][0] = .275;
      refs.projectScreen.lengthTargets[0][0] = .5;
      refs.projectScreen.lengthTargets[1][0] = .7;
    } else {
      refs.rings[0].radiusTargets[0][0] = .3;
      refs.rings[0].radiusTargets[1][0] = .45;
      refs.rings[1].radiusTargets[0][0] = .25;
      refs.rings[1].radiusTargets[1][0] = .35;
      refs.rings[2].radiusTargets[0][0] = .43;
      refs.rings[2].radiusTargets[1][0] = .8;
      refs.rings[3].radiusTargets[0][0] = .15;
      refs.rings[3].radiusTargets[1][0] = .175;
      refs.projectScreen.lengthTargets[0][0] = .4;
      refs.projectScreen.lengthTargets[1][0] = .56;
    }
    if (widthHeightRatio > .66) {
      refs.projectScreen.lengthTargets[0][0] = .5;
      refs.projectScreen.lengthTargets[1][0] = .7;
    } else {
      refs.projectScreen.lengthTargets[0][0] = .35;
      refs.projectScreen.lengthTargets[1][0] = .5;
    }
  },[appState.viewportSnappedSize]); //eslint-disable-line

  const setTargets = () => {
    refs.rings[0].angleTargets[0][0] = standardizeAngle(refs.rings[0].angleTargets[0][0] - .01);
    refs.rings[1].angleTargets[0][0] = standardizeAngle(refs.rings[1].angleTargets[0][0] + .01);
    refs.rings[2].angleTargets[0][0] = standardizeAngle(.5*Math.sin(.3*refs.t) + .5);
    refs.rings[3].angleTargets[0][0] = standardizeAngle(refs.rings[3].angleTargets[0][0] - .003);
  }

  const standardizeAngle = (angle: number): number => {
    return (angle % (2*Math.PI) + 2*Math.PI) % (2*Math.PI);
  }

  const averageAngles = (angles: [number, number][]) => {
    let rtn: number = 0;
    let rtnWeight: number = 0;
    for (const [ angle, weight ] of angles) {
      const da: number = rtn - angle;
      if (Math.abs(da) > Math.PI) {
        rtn -= Math.sign(da)*2*Math.PI;
      }
      rtn = rtn*rtnWeight/(rtnWeight + weight) + angle*weight/(rtnWeight + weight);
      rtnWeight += weight;  
    }
    return rtn;
  }

  const tweens = (dt: number) => {
    // ui rings tween
    if (refs.t > introTerrainAnimDuration + 1) {
      for (let ring of refs.rings) {
        const angleTarget: number = standardizeAngle(averageAngles(ring.angleTargets));
        let da: number = angleTarget - ring.angle;
        if (Math.abs(da) > Math.PI) {
          ring.angle += Math.sign(da)*2*Math.PI;
        }
        da = angleTarget - ring.angle;
        ring.angle += Helpers.clamp(dt*(ringsAngleTweenData[0]*da + Math.sign(da)*ringsAngleTweenData[1]), 
          -Math.abs(da), Math.abs(da));
        let radiusTarget: number = 0;
        for (const [ rad, weight ] of ring.radiusTargets) {
          radiusTarget += rad*weight;
        }
        const dr: number = radiusTarget - ring.radius;
        if (dr > 0) {
          ring.radius += Math.min(dr, dt*(ringsRadiusTweenData[0]*dr + ringsRadiusTweenData[1]));
        } else {
          ring.radius += Math.max(dr, dt*(ringsRadiusTweenData[2]*dr - ringsRadiusTweenData[3]));
        }
      }
    }
    //project screen tween
    if (refs.t > introTerrainAnimDuration + 1.25) {
      let targetLength: number = 0;
      for (const [ length, weight ] of refs.projectScreen.lengthTargets) {
        targetLength += length*weight;
      }
      const dl: number = targetLength - refs.projectScreen.length;
      if (dl > 0) {
        refs.projectScreen.length += Math.min(dl, dt*(screenLengthTweenData[0]*dl + screenLengthTweenData[1]));
      } else {
        refs.projectScreen.length += Math.max(dl, dt*(screenLengthTweenData[2]*dl - screenLengthTweenData[3]));
      }
    }
  }

  const toSVGspace = (v2: V2): V2 => {
    const screenSize: V2 = new V2(window.innerWidth, window.innerHeight - .1*window.innerWidth);
    return v2.add(0, -.1*window.innerWidth).parallelProduct(1/screenSize.x, 1/screenSize.y).scale(100);
  }

  const render = (): void => {
    const headerHeight: number = .1*window.innerWidth;
    const bodyHeight: number = window.innerHeight - headerHeight;
    //set opacities
    if (!refs.mainDivRefs[0].current) { return; }
    if (!refs.mainDivRefs[2].current) { return; }
    refs.mainDivRefs[0].current.style.opacity = refs.opacities[0].toString();
    refs.mainDivRefs[2].current.style.opacity = refs.opacities[2].toString();
    if (refs.mainDivRefs[1].current) {
      refs.mainDivRefs[1].current.style.opacity = refs.opacities[1].toString();
    }
    // set ring styles
    for (let ring of refs.rings) {
      if (!ring.ref.current) { continue; }
      ring.ref.current.style.width = ring.radius*2*bodyHeight + "px";
      ring.ref.current.style.height = ring.radius*2*bodyHeight + "px";
      ring.ref.current.style.opacity = ring.opacity.toString();
      ring.ref.current.style.transform = "matrix(" + Math.cos(ring.angle) + "," + -Math.sin(ring.angle) + "," 
        + Math.sin(ring.angle) + "," + Math.cos(ring.angle) + "," + -ring.radius*bodyHeight + "," + -ring.radius*bodyHeight + ")";
    }
    document.querySelectorAll(".circlePath").forEach( v => {
      (v as SVGElement).style.fill = "rgb(" + refs.rings[0].color.x + "," + refs.rings[0].color.y + "," + refs.rings[0].color.z + ")";
    });
    // set project image "screen" styles
    if (!refs.projectScreen.ref.current) { return; }
    const projectScreenSize: V2 = new V2(1, .66).scale(refs.projectScreen.length*bodyHeight);
    refs.projectScreen.ref.current.style.width = projectScreenSize.x + "px";
    refs.projectScreen.ref.current.style.height = projectScreenSize.y + "px";
    // set annotations styles
    for (const annotation of refs.annotations) {
      const startPos: V2 = annotation.lineStart.parallelProduct(new V2(window.innerWidth, bodyHeight)).add(new V2(0, headerHeight));
      const startSVGPos: V2 = toSVGspace(startPos);
      const bendPos: V2 = annotation.lineBend.parallelProduct(new V2(window.innerWidth, bodyHeight)).add(new V2(0, headerHeight));
      const bendSVGPos: V2 = toSVGspace(bendPos);
      const endPos: V2 = new V2(.5*window.innerWidth, .55*window.innerHeight)
        .add(projectScreenSize.parallelProduct(annotation.lineEndRelProjectScreen));
      const endSVGPos: V2 = toSVGspace(endPos);
      const d: string = "M " + startSVGPos.x + "," + startSVGPos.y + " " + bendSVGPos.x + "," + bendSVGPos.y + " " + endSVGPos.x + "," + endSVGPos.y;
      annotation.lineRef.current.setAttribute("d", d);
      annotation.circleRef.current.setAttribute("cx", endSVGPos.x.toString());
      annotation.circleRef.current.setAttribute("cy", endSVGPos.y.toString());
      annotation.textRef.current.style.left = startPos.x + Math.sign(startSVGPos.x - 50)*10 + "px";
      annotation.textRef.current.style.top = startPos.y + "px";
      annotation.textRef.current.style.opacity = "1";
    }
  }

  const selectCircles: JSX.Element[] = [];
  for (let i = 0; i < selectCirclesCount; ++i) {
    selectCircles.push(
      <SelectCircle circleIdx={i} totalCircles={selectCirclesCount} projectsState={state} setProjectsState={setState} key={i} />
    );
  }
  let projectAnnotations: JSX.Element | undefined = undefined;
  if (appState.viewportSnappedSize.y / appState.viewportSnappedSize.x < 1.25) {
    projectAnnotations = <ProjectAnnotations projectsRefs={refs} projectsState={state} appState={appState}/>;
  } else {
    refs.annotations = [];
  }
  const projAnnoFontSize: number = Math.max(25, .035*appState.viewportSnappedSize.x);
  const projAnnoWidth: number = 15*projAnnoFontSize;
  let projAnnoBottom: number;
  if (appState.viewportSnappedSize.x / appState.viewportSnappedSize.y > 1.25) {
    projAnnoBottom = 120;
  } else {
    projAnnoBottom = 140;
  }
  return(
    <section id="projects">
      <div id="svgUI" ref={refs.mainDivRefs[0]} style={{opacity: 0}}>
        <Circle1 reff={refs.rings[0].ref}/>
        <Circle2 reff={refs.rings[1].ref}/>
        <Circle3 reff={refs.rings[2].ref}/>
        <Circle4 reff={refs.rings[3].ref}/>
        <Arrow isLeft={true} projectsState={state} setProjectsState={setState} appState={appState} />
        <Arrow isLeft={false} projectsState={state} setProjectsState={setState} appState={appState} />
        {selectCircles}
      </div>
      <div id="annotationsUI" ref={refs.mainDivRefs[1]} style={{opacity: 0}}>
        {projectAnnotations}
        <p 
          id="projectAnnotation" 
          ref={refs.projectAnnotation} 
          style={{fontSize: projAnnoFontSize, width: projAnnoWidth, bottom: projAnnoBottom}}
        >{Projects[state.projectIndex].title}</p>
      </div>
      <div id="screenUI" ref={refs.mainDivRefs[2]} style={{opacity: 0}}>
        <ProjectScreen projectIdx={state.projectIndex} projectRefs={refs} />
      </div>
    </section>
  );
}