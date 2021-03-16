import React from "react";

export interface Props {
  style?: Object;
}

export const SkillOutline: React.FC<Props> = ({ style={} }) => {
  return (
    <svg
      width="600"
      height="100"
      viewBox="0 0 600 100"
      className="skillOutline"
      preserveAspectRatio="none"
      style={style}
    >
      <defs>
        <linearGradient id="grad0" x2="0" y1="100%" y2="0" >
          <stop style={{stopColor:"#ffffff",stopOpacity:0.18875502}} offset="0" />
          <stop style={{stopColor:"#ffffff",stopOpacity:0,}} offset="100%" />
        </linearGradient>
      </defs>
      <g>
        <path
          style={{fill:"url(#grad0)",stroke:"#ffffff",strokeWidth:4,strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1,fillOpacity:1}}
          d="M 42.173867,67.80649 -37.210185,69.943258 -78.752706,2.2630376 -40.911176,-67.553952 38.472875,-69.69072 80.015397,-2.0104994 Z"
          transform="matrix(-0.70474007,0.01922982,0.01923424,0.70457814,57.942505,49.900253)" 
        />
        <path
          style={{fill:"none",stroke:"#ffffff",strokeWidth:3,strokeLinecap:"butt",strokeLinejoin:"miter",strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1}}
          d="M 578.57143,93.186573 H 111.49559 L 97.858528,77.024132"
        />
        <path
          style={{fill:"none",stroke:"#ffffff",strokeWidth:1.45744,strokeLinecap:"butt",strokeLinejoin:"miter",strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1}}
          d="M 578.05586,94.2218 592.85804,75.340534"
        />
        <path
          style={{fill:"none",stroke:"#ffffff",strokeWidth:1,strokeLinecap:"butt",strokeLinejoin:"miter",strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1}}
          d="m 101.45362,72.88067 13.10107,15.279009 467.5015,0.143767"
        />
        <path
          style={{fill:"url(#grad0)",stroke:"none",strokeWidth:"1px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1,fillOpacity:1}}
          d="m 113.48622,49.980339 -12.0326,22.900331 13.10107,15.279009 467.5015,0.143767 10.80185,-12.962912 0,-25.36955 z"
        />
      </g>
    </svg>
  );
}