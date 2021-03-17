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

const introTerrainAnimDuration: number = 3.5;
const tweenCoeff: number = .1;
const tweenAngleOffset: number = 0.01;
const tweenRadiusOffset: number = 0.02;
const tweenLengthOffset: number = .02;
const selectCirclesCount: number = 3;

export const projectsArr: string[] = ["Pathfinder", "Spheres", "Algodesi"];

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

export const Projects: React.FC<Props> = ({ appState, appStateDispatch }) => {

  const [ state, setState ] = React.useState<State>(initState); //eslint-disable-line
  let { current: refs } = React.useRef<Refs>(initRefs);

  React.useEffect(() => {
    for (const ring of refs.rings) {
      ring.radius = 0;
      ring.ref.current.style.width = "0";
      ring.ref.current.style.height = "0";
    }
    refs.projectScreen.length = 0;
    refs.projectScreen.ref.current.style.width = "0";
    if (refs.t) { return; }
    const uiClock = () => {
      setTargets();
      tweens();
      render();
      setTimeout(() => {
        refs.t += .03;
        uiClock();
      }, 0);
    }; uiClock();
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
  },[state.projectIndex]); //eslint-disable-line

  React.useEffect(() => {
    const widthHeightRatio: number = appState.viewportSnappedSize.x/appState.viewportSnappedSize.y;
    if (widthHeightRatio > 1.5) {
      refs.rings[0].radiusTargets[0][0] = .3;
      refs.rings[0].radiusTargets[1][0] = .6;
      refs.rings[1].radiusTargets[0][0] = .25;
      refs.rings[1].radiusTargets[1][0] = .5;
      refs.rings[2].radiusTargets[0][0] = .4;
      refs.rings[2].radiusTargets[1][0] = .8;
      refs.rings[3].radiusTargets[0][0] = .175;
      refs.rings[3].radiusTargets[1][0] = .35;
      refs.projectScreen.lengthTargets[0][0] = .5;
      refs.projectScreen.lengthTargets[1][0] = .7;
    } else {
      refs.rings[0].radiusTargets[0][0] = .21;
      refs.rings[0].radiusTargets[1][0] = .42;
      refs.rings[1].radiusTargets[0][0] = .18;
      refs.rings[1].radiusTargets[1][0] = .36;
      refs.rings[2].radiusTargets[0][0] = .28;
      refs.rings[2].radiusTargets[1][0] = .56;
      refs.rings[3].radiusTargets[0][0] = .125;
      refs.rings[3].radiusTargets[1][0] = .25;
      refs.projectScreen.lengthTargets[0][0] = .4;
      refs.projectScreen.lengthTargets[1][0] = .56;
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

  const tweens = () => {
    // ui rings tween
    if (refs.t > introTerrainAnimDuration + 1) {
      for (let ring of refs.rings) {
        const angleTarget: number = standardizeAngle(averageAngles(ring.angleTargets));
        let da: number = angleTarget - ring.angle;
        if (Math.abs(da) > Math.PI) {
          ring.angle += Math.sign(da)*2*Math.PI;
        }
        da = angleTarget - ring.angle;
        ring.angle += Math.min(Math.abs(da), Math.max(-Math.abs(da), tweenCoeff*da + Math.sign(da)*tweenAngleOffset));
        let radiusTarget: number = 0;
        for (const [ rad, weight ] of ring.radiusTargets) {
          radiusTarget += rad*weight;
        }
        const dr: number = radiusTarget - ring.radius;
        ring.radius += Math.min(Math.abs(dr), Math.max(-Math.abs(dr), tweenCoeff*dr + Math.sign(dr)*tweenRadiusOffset));
      }
    }
    //project screen tween
    if (refs.t > introTerrainAnimDuration + 2) {
      let targetLength: number = 0;
      for (const [ length, weight ] of refs.projectScreen.lengthTargets) {
        targetLength += length*weight;
      }
      const dl: number = targetLength - refs.projectScreen.length;
      refs.projectScreen.length += Math.min(Math.abs(dl), Math.max(-Math.abs(dl), tweenCoeff*dl + Math.sign(dl)*tweenLengthOffset));
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
    if (!refs.mainDivRefs[1].current) { return; }
    if (!refs.mainDivRefs[2].current) { return; }
    refs.mainDivRefs[0].current.style.opacity = refs.opacities[0].toString();
    refs.mainDivRefs[1].current.style.opacity = refs.opacities[1].toString();
    refs.mainDivRefs[2].current.style.opacity = refs.opacities[2].toString();
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
        <ProjectAnnotations projectsRefs={refs} projectsState={state} appState={appState}/>
        <p id="projectAnnotation" ref={refs.projectAnnotation}>{projectsArr[state.projectIndex]}</p>
      </div>
      <div id="screenUI" ref={refs.mainDivRefs[2]} style={{opacity: 0}}>
        <ProjectScreen projectIdx={state.projectIndex} projectRefs={refs} />
      </div>
      <p id="debug0" style={{position:"absolute", top: "300px", left: "20px"}} ref={refs.debug0} />
      <p id="debug1" style={{position:"absolute", top: "320px", left: "20px"}} ref={refs.debug1} />
    </section>
  );
}