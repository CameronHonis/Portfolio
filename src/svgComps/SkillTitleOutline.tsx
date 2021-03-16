import React from "react";

export interface Props {
  style?: Object;
}

export const SkillTitleOutline: React.FC<Props> = ({ style={} }) => {
  return(
    <svg
      viewBox="0 0 400 100"
      width="400"
      height="100"
      preserveAspectRatio="none"
      className="skillTitleOutline"
      style={style}
    >
      <defs>
        <linearGradient
          x1="0"
          x2="0"
          y1="100"
          y2="0"
          gradientUnits="userSpaceOnUse"
          id="grad2"
        >
          <stop offset="0" stopColor="rgb(255,255,255)" stopOpacity=".2" />
          <stop offset=".8" stopColor="rgb(255,255,255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 398,2 398,70 370,98 30,98 2,70 2,2" fill="url(#grad2)" stroke="white" strokeWidth="2" />
    </svg>
  );
}