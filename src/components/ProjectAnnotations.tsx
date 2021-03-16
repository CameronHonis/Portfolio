import React from "react";
import { AppState } from "../App";
import { V2 } from "../models/V2";
import { Refs as ProjectsRefs, State as ProjectsState } from "./Projects";

export interface Props {
  projectsState: ProjectsState;
  projectsRefs: ProjectsRefs;
  appState: AppState;
}

export interface AnnotationReactRefs {
  circleRef: React.MutableRefObject<SVGEllipseElement>;
  lineRef: React.MutableRefObject<SVGPathElement>;
  textRef: React.MutableRefObject<HTMLParagraphElement>;
}

export const ProjectAnnotations: React.FC<Props> = ({ projectsState, projectsRefs, appState }) => {

  projectsRefs.annotations = [];
  const annotationSVGs: JSX.Element[] = [];
  const annotations: JSX.Element[] = [];
  const widthHeightRatio: number = appState.viewportSnappedSize.x/appState.viewportSnappedSize.y;
  const circleRY: number = .5*appState.viewportSnappedSize.x/(appState.viewportSnappedSize.y - .1*appState.viewportSnappedSize.x);
  const getReactRefs = (): AnnotationReactRefs => {
    return {
      circleRef: React.createRef() as React.MutableRefObject<SVGEllipseElement>,
      lineRef: React.createRef() as React.MutableRefObject<SVGPathElement>,
      textRef: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
    };
  }
  if (projectsState.projectIndex === 0) { //pathfinder
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.25, .2) : new V2(.18, .275),
      lineBend: widthHeightRatio > 1.5 ? new V2(.3, .2) : new V2(.23, .275),
      lineEndRelProjectScreen: new V2(-.4,-.4),
      text: "React",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.75, .2) : new V2(.82, .275),
      lineBend: widthHeightRatio > 1.5 ? new V2(.7, .2) : new V2(.77, .275),
      lineEndRelProjectScreen: new V2(.35, -.4),
      text: "Typescript",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.725, .35) : new V2(.795, .425),
      lineBend: widthHeightRatio > 1.5 ? new V2(.675, .35) : new V2(.745, .425),
      lineEndRelProjectScreen: new V2(.4, -.15),
      text: "Graph Theory",
    });
  } else if (projectsState.projectIndex === 1) { // spheres
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.25, .2) : new V2(.18, .275),
      lineBend: widthHeightRatio > 1.5 ? new V2(.3, .2) : new V2(.23, .275),
      lineEndRelProjectScreen: new V2(-.4, -.4),
      text: "3D Rendering",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.75, .2) : new V2(.82, .275),
      lineBend: widthHeightRatio > 1.5 ? new V2(.7, .2) : new V2(.77, .275),
      lineEndRelProjectScreen: new V2(.35, -.4),
      text: "Templatized meshes",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.275, .35) : new V2(.205, .425),
      lineBend: widthHeightRatio > 1.5 ? new V2(.325, .35) : new V2(.255, .425),
      lineEndRelProjectScreen: new V2(-.4, -.15),
      text: "Raycasting",
    });
  } else if (projectsState.projectIndex === 2) { // algodesi
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.25, .175) : new V2(.18, .275),
      lineBend: widthHeightRatio > 1.5 ? new V2(.3, .175) : new V2(.23, .275),
      lineEndRelProjectScreen: new V2(-.4, -.4),
      text: "2D Physics Engine",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.75, .175) : new V2(.82, .275),
      lineBend: widthHeightRatio > 1.5 ? new V2(.7, .175) : new V2(.77, .275),
      lineEndRelProjectScreen: new V2(.35, -.4),
      text: "Algorithm sandbox",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.275, .45) : new V2(.205, .425),
      lineBend: widthHeightRatio > 1.5 ? new V2(.325, .45) : new V2(.255, .425),
      lineEndRelProjectScreen: new V2(-.4, -.075),
      text: "React",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.725, .35) : new V2(.795, .425),
      lineBend: widthHeightRatio > 1.5 ? new V2(.675, .35) : new V2(.745, .425),
      lineEndRelProjectScreen: new V2(.4, -.15),
      text: "Typescript",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.275, .65) : new V2(.205, .65),
      lineBend: widthHeightRatio > 1.5 ? new V2(.325, .65) : new V2(.255, .65),
      lineEndRelProjectScreen: new V2(-.4, .3),
      text: "Data structures",
    });
    projectsRefs.annotations.push({
      ...getReactRefs(),
      lineStart: widthHeightRatio > 1.5 ? new V2(.725, .65) : new V2(.795, .65),
      lineBend: widthHeightRatio > 1.5 ? new V2(.675, .65) : new V2(.745, .65),
      lineEndRelProjectScreen: new V2(.4, .3),
      text: "Dynamic Scaled UI",
    });
  }

  for (const annotation of projectsRefs.annotations) {
    annotationSVGs.push(
      <svg
        viewBox="0 0 100 100"
        width="100"
        height="100"
        className="annotationSVG"
        preserveAspectRatio="none"
        key={annotationSVGs.length}
      >
        <ellipse
          rx=".5"
          ry={circleRY.toString()}
          ref={annotation.circleRef}
        />
        <path
          ref={annotation.lineRef}
        />
      </svg>
    );
    const textTransform: string = "translate(" + (annotation.lineStart.x > .5 ? "0" : "-100%") + ",-50%";
    const padding: ["paddingLeft" | "paddingRight", string] 
      = annotation.lineStart.x > .5 ? ["paddingRight", "20px"] : ["paddingLeft", "20px"];
    annotations.push(
      <p
        className="annotation"
        ref={annotation.textRef}
        key={annotations.length}
        style={{
          transform: textTransform, 
          WebkitTransform: textTransform, 
          OTransform: textTransform, 
          msTransform: textTransform, 
          ["MozTransform" as any]: textTransform,
          [padding[0]]: padding[1],
        }}
      >{annotation.text}</p>
    );
  }
  return(
    <div id="annotations" >
      {annotationSVGs}
      {annotations}
    </div>
  );
}