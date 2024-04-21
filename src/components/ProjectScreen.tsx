import React from "react";
import { Refs as ProjectRefs } from "./ProjectsFC";
import {Projects} from "../models/Projects";

export interface Props {
  projectIdx: number;
  projectRefs: ProjectRefs
}

export const ProjectScreen: React.FC<Props> = ({ projectIdx, projectRefs }) => {
  const screenMouseOver = (e: React.MouseEvent): void => {
    projectRefs.projectScreen.lengthTargets[0][1] = 0;
    projectRefs.projectScreen.lengthTargets[1][1] = 1;
    for (const ring of projectRefs.rings) {
      ring.angleTargets[0][1] = .2;
      ring.angleTargets[1][1] = .8;
      ring.radiusTargets[0][1] = 0;
      ring.radiusTargets[1][1] = 1;
      ring.opacity = .6;
    }
  }

  const screenMouseLeave = (e: React.MouseEvent): void => {
    projectRefs.projectScreen.lengthTargets[0][1] = 1;
    projectRefs.projectScreen.lengthTargets[1][1] = 0;
    for (const ring of projectRefs.rings) {
      ring.angleTargets[0][1] = 1;
      ring.angleTargets[1][1] = 0;
      ring.radiusTargets[0][1] = 1;
      ring.radiusTargets[1][1] = 0;
      ring.opacity = .25;
    }
  }

  const mouseClick = (e: React.MouseEvent): void => {
    window.open(Projects[projectIdx].url);
  }

  const image = Projects[projectIdx].image;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="150"
      height="100"
      viewBox="0 0 150 100"
      version="1.1"
      id="projectScreenSVG"
      ref={projectRefs.projectScreen.ref}
    >
      <defs>
        <linearGradient id="a" y1="0%" x2="0" y2="100%" >
          <stop style={{stopColor: "rgb(255,255,255)"}} />
          <stop offset="70%" style={{stopColor: "rgb(92,92,92)"}} />
          <stop offset = "100%" style={{stopColor: "rgb(177,177,177)"}} />
        </linearGradient>
        <pattern id="project0pattern" patternUnits="userSpaceOnUse" width="150" height="100">
          <image href={image} x="0" y="0" width="150" height="100" />
        </pattern>
      </defs>
      <path
        style={{fill:"url(#project0pattern)",stroke:"url(#a)",strokeWidth:"2px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1}}
        d="M 2,2 130,2 148,25 148,98 20,98 2,75 Z"
        id="projectScreenPath"
        onMouseOver={e => screenMouseOver(e)}
        onMouseLeave={e => screenMouseLeave(e)}
        onClick={e => mouseClick(e)}
      />
    </svg>
  );
}