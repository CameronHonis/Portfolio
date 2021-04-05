import React from "react";
import { Helpers } from "../services/Helpers";
import { State as ProjectsState } from "../components/Projects";

export interface Props {
  circleIdx: number;
  totalCircles: number;
  projectsState: ProjectsState;
  setProjectsState: React.Dispatch<React.SetStateAction<ProjectsState>>;
}

export interface Refs {
  svgRef: React.MutableRefObject<SVGSVGElement>;
  ellipseRef: React.MutableRefObject<SVGEllipseElement>;
}

export const initRefs: Refs = {
  svgRef: React.createRef() as React.MutableRefObject<SVGSVGElement>,
  ellipseRef: React.createRef() as React.MutableRefObject<SVGEllipseElement>,
}

export interface State {
  mouseOver: boolean;
}

export const initState: State = {
  mouseOver: false,
}

export const SelectCircle: React.FC<Props> = ({ circleIdx, totalCircles, projectsState, setProjectsState }) => {
  let { current: refs } = React.useRef<Refs>(Helpers.deepCopy(initRefs) as Refs);
  const [ state, setState ] = React.useState<State>(Helpers.deepCopy(initState) as State);

  React.useEffect(() => {
    if (projectsState.projectIndex === circleIdx) {
      refs.ellipseRef.current.style.fill = "rgba(255,255,255,1)";
    } else {
      if (!state.mouseOver) {
        refs.ellipseRef.current.style.fill = "rgba(255,255,255,0)";
      }
    }
  },[projectsState.projectIndex]); //eslint-disable-line

  React.useEffect(() => {
    if (projectsState.projectIndex === circleIdx) { return; }
    if (state.mouseOver) {
      refs.ellipseRef.current.style.fill = "rgba(255,255,255,.5)";
    } else {
      refs.ellipseRef.current.style.fill = "rgba(255,255,255,0)";
    }
  },[state]); //eslint-disable-line

  const ellipseMouseOver = (e: React.MouseEvent): void => {
    setState({...state, mouseOver: true});
  }

  const ellipseMouseLeave = (e: React.MouseEvent): void => {
    setState({...state, mouseOver: false});
  }

  const ellipseClick = (e: React.MouseEvent): void => {
    //if !projectsState.inAnimation
    setProjectsState({...projectsState, projectIndex: circleIdx});
  }

  return(
    <div 
      className="selectCircle" 
      onMouseOver={e => ellipseMouseOver(e)}
      onMouseLeave={e => ellipseMouseLeave(e)}
      onClick={e => ellipseClick(e)}
      style={{left: "calc(50% + " + (circleIdx - Math.floor(totalCircles/2))*60 + "px)"}}
    >
      <svg
        viewBox="0 0 100 100"
        height="100"
        width="100"
        ref={refs.svgRef}
      >
        <ellipse
          rx="46"
          ry="46"
          cy="50"
          cx="50"
          style={{stroke: "rgb(255,255,255)", strokeWidth: "8"}}
          ref={refs.ellipseRef}
        />
      </svg>
    </div>
    
  );
}