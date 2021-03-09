import React, { SetStateAction } from "react";
import { AppState } from "./App";
import { Circle1 } from "./svgComps/Circle1";
import { Circle2 } from "./svgComps/Circle2";
import { Circle3 } from "./svgComps/Circle3";
import { Circle4 } from "./svgComps/Circle4";

export interface Props {
  appState: AppState;
  setAppState: React.Dispatch<SetStateAction<AppState>>;
}

export interface RingRef {
  ref: React.MutableRefObject<SVGSVGElement>;
  radius: number;
  radiusTarget: number;
  angle: number;
  angleTargets: [number, number][]; // [angle, weight] idx0=nativeAngle idx1=cursorBased
}

export interface Refs {
  t: number;
  rings: RingRef[];

}

export const initRefs: Refs = {
  t: 0,
  rings: [
    {
      ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
      radius: 0,
      radiusTarget: .3*window.innerHeight,
      angle: 0,
      angleTargets: [[0, 1], [0, 0]],
    },
    {
      ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
      radius: 0,
      radiusTarget: .25*window.innerHeight,
      angle: 0,
      angleTargets: [[0, 1], [Math.PI/4, 0]],
    },
    {
      ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
      radius: 0,
      radiusTarget: .4*window.innerHeight,
      angle: 0,
      angleTargets: [[0, 1], [Math.PI*3/2, 0]],
    },
    {
      ref: React.createRef() as React.MutableRefObject<SVGSVGElement>,
      radius: 0,
      radiusTarget: .125*window.innerHeight,
      angle: 0,
      angleTargets: [[0, 1], [-Math.PI/2, 0]],
    }
  ]
}

const tweenCoeff: number = .05;
const tweenAngleOffset: number = 0.01;
const tweenRadiusOffset: number = 0.01;

export const Projects: React.FC<Props> = ({ appState, setAppState }) => {

  let { current: refs } = React.useRef<Refs>(initRefs);

  React.useEffect(() => {
    document.addEventListener("mousemove", (e: MouseEvent) => {
      //const centerDis: number = Math.sqrt(e.clientX*e.clientX + e.clientY*e.clientY);
    });
    const uiClock = () => {
      setTargets();
      tweens();
      render();
      setTimeout(() => {
        refs.t += .03;
        uiClock();
      }, 30);
    }; uiClock();
  },[]); //eslint-disable-line

  const setTargets = () => {
    refs.rings[0].angleTargets[0][0] -= .01;
    refs.rings[1].angleTargets[0][0] += .01;
    refs.rings[2].angleTargets[0][0] = .5*Math.sin(.3*refs.t) + .5;
    refs.rings[3].angleTargets[0][0] -= .003;
  }

  const tweens = () => {
    for (let ring of refs.rings) {
      let angleTarget: number = 0;
      for (const [ angle, weight ] of ring.angleTargets) {
        angleTarget += angle*weight;
      }
      const da: number = angleTarget - ring.angle;
      ring.angle += Math.min(Math.abs(da), Math.max(-Math.abs(da), tweenCoeff*da + Math.sign(da)*tweenAngleOffset));
      const dr: number = ring.radiusTarget - ring.radius;
      ring.radius += Math.min(Math.abs(dr), Math.max(-Math.abs(dr), tweenCoeff*dr + Math.sign(dr)*tweenRadiusOffset));
    }
  }

  const render = () => {
    for (let ring of refs.rings) {
      if (!ring.ref.current) { continue; }
      ring.ref.current.style.width = ring.radius*2 + "px";
      ring.ref.current.style.height = ring.radius*2 + "px";
      ring.ref.current.style.transform = "matrix(" + Math.cos(ring.angle) + "," + -Math.sin(ring.angle) + "," 
        + Math.sin(ring.angle) + "," + Math.cos(ring.angle) + "," + -ring.radius + "," + -ring.radius + ")";
    }
  }

  return(
    <section id="projects">
      <div id="projectScreen">

      </div>
      <Circle1 reff={refs.rings[0].ref}/>
      <Circle2 reff={refs.rings[1].ref}/>
      <Circle3 reff={refs.rings[2].ref}/>
      <Circle4 reff={refs.rings[3].ref}/>
    </section>
  );
}