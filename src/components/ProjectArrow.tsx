import React from "react";
import { AppState } from "../App";
import { Helpers } from "../services/Helpers";
import { V2 } from "../models/V2";
import { projectsArr, State as ProjectsState } from "./Projects";

export interface Props {
  isLeft: boolean;
  projectsState: ProjectsState;
  setProjectsState: React.Dispatch<React.SetStateAction<ProjectsState>>;
  appState: AppState;
}

export interface Refs {
  svgRef: React.MutableRefObject<SVGSVGElement>;
  pathRef: React.MutableRefObject<SVGPathElement>;
  annotationRef: React.MutableRefObject<HTMLParagraphElement>;
}

export const initRefs: Refs = {
  svgRef: React.createRef() as React.MutableRefObject<SVGSVGElement>,
  pathRef: React.createRef() as React.MutableRefObject<SVGPathElement>,
  annotationRef: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
}

export const Arrow: React.FC<Props> = ({ isLeft, projectsState, setProjectsState, appState }) => {

  let { current: refs } = React.useRef<Refs>(Helpers.deepCopy(initRefs) as Refs);

  const mouseOver = (e: React.MouseEvent): void => {
    if (!refs.pathRef.current) { return; }
    if (!refs.annotationRef) { return; }
    refs.pathRef.current.style.fill = "rgba(255,255,255,.5)";
    refs.pathRef.current.style.stroke = "rgba(255,255,255,1)";
    refs.annotationRef.current.style.opacity = "1";

  }

  const mouseLeave = (e: React.MouseEvent): void => {
    if (!refs.pathRef.current) { return; }
    if (!refs.annotationRef.current) { return; }
    refs.pathRef.current.style.fill = "rgba(255,255,255,0)";
    refs.pathRef.current.style.stroke = "rgba(255,255,255,.5)";
    refs.annotationRef.current.style.opacity = "0";
  }

  const mouseDown = (e: React.MouseEvent): void => {
    if (!refs.pathRef.current) { return; }
    refs.pathRef.current.style.fill = "rgba(255,255,255,.75)";
  }

  const mouseUp = (e: React.MouseEvent): void => {
    if (!refs.pathRef.current) { return; }
    refs.pathRef.current.style.fill = "rgba(255,255,255,.5)";
  }

  const click = (e: React.MouseEvent): void => {
    // check to see if projects screen is ready to switch project
    setProjectsState({
      ...projectsState,
      projectIndex: nextIdx,
    });
  }

  const weightHeightRatio: number = appState.viewportSnappedSize.x/appState.viewportSnappedSize.y;
  let arrowTopPos: string;
  if (weightHeightRatio > 1.5) {
    arrowTopPos = "55vh";
  } else {
    arrowTopPos = "calc(100% - 80px)";
  }
  const nextIdx: number = Helpers.fitIndex(projectsState.projectIndex + (isLeft ? -1 : 1), projectsArr.length);
  let arrowMatrix: string, arrowLeftPos: string, arrowSize: V2, annotationLeftPos: string, annotationTopPos: string;
  if (isLeft) {
    if (weightHeightRatio > 1.5) {
      arrowMatrix = "matrix(-1,0,0,1," + (-.04*appState.viewportSnappedSize.y) + "," + (-.06*appState.viewportSnappedSize.y) + ")";
      arrowLeftPos = "8vh";
      arrowSize = new V2(.08*appState.viewportSnappedSize.y, .12*appState.viewportSnappedSize.y);
      annotationLeftPos = "8vh";
      annotationTopPos = "65vh";
    } else {
      arrowMatrix = "matrix(-1,0,0,1," + (-.025*appState.viewportSnappedSize.y) + "," + (-.0375*appState.viewportSnappedSize.y) + ")";
      arrowLeftPos = "30vw";
      arrowSize = new V2(.05*appState.viewportSnappedSize.y, .075*appState.viewportSnappedSize.y);
      annotationLeftPos = "20vw";
      annotationTopPos = "calc(100% - 80px)";
    }
  } else {
    if (weightHeightRatio > 1.5) {
      arrowMatrix = "matrix(1,0,0,1," + (-.04*appState.viewportSnappedSize.y) + "," + (-.06*appState.viewportSnappedSize.y) + ")";
      arrowLeftPos = "calc(100vw - 8vh)";
      arrowSize = new V2(.08*appState.viewportSnappedSize.y, .12*appState.viewportSnappedSize.y);
      annotationLeftPos = "calc(100% - 80px)";
      annotationTopPos = "65vh";
    } else {
      arrowMatrix = "matrix(1,0,0,1," + (-.025*appState.viewportSnappedSize.y) + "," + (-.0375*appState.viewportSnappedSize.y) + ")";
      arrowLeftPos = "70vw";
      arrowSize = new V2(.05*appState.viewportSnappedSize.y, .075*appState.viewportSnappedSize.y);
      annotationLeftPos = "80vw";
      annotationTopPos = "calc(100% - 80px)";
    }
  }

  return(
    <div className="arrow">
      <svg
        viewBox="0 0 100 100"
        width="100"
        height="100"
        className="arrowSVG"
        style={{
          transform: arrowMatrix, WebkitTransform: arrowMatrix, left: arrowLeftPos, 
          top: arrowTopPos, width: arrowSize.x + "px", height: arrowSize.y + "px"
        }}
        preserveAspectRatio="none"
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onMouseDown={e => mouseDown(e)}
        onMouseUp={e => mouseUp(e)}
        onClick={e => click(e)}
        ref={refs.svgRef}
      >
        <path
          d="M 98,50 40,98 2,98 60,50 2,2 40,2 Z"
          style={{fill: "rgba(255,255,255,0)", stroke: "rgba(255,255,255,.5)"}}
          ref={refs.pathRef}
        />
      </svg>
      <p
        className="arrowAnnotation"
        style={{left: annotationLeftPos, top: annotationTopPos}}
        ref={refs.annotationRef}
      >{projectsArr[nextIdx]}</p>
    </div>
  );
}