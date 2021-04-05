import React from "react"

interface Props {
  style: Object;
}

export interface State {
  mouseOver: boolean;
  mouseDown: boolean;
}

export const initState: State = {
  mouseOver: false,
  mouseDown: false,
}

export const Linkedin: React.FC<Props> = ({ style }) => {
  const [ state, setState ] = React.useState(initState);

  let stopColor0: string, stopColor1: string;
  if (state.mouseDown) {
    stopColor0 = "rgba(255,255,255,1)";
    stopColor1 = "rgba(255,255,255,.7)";
  } else if (state.mouseOver) {
    stopColor0 = "rgba(255,255,255,.8)";
    stopColor1 = "rgba(255,255,255,.4)";
  } else {
    stopColor0 = "rgba(255,255,255,.5)";
    stopColor1 = "rgba(255,255,255,.1)"
  }
  return(
    <svg viewBox="-2 -2 28 28" xmlns="http://www.w3.org/2000/svg" className="social" id="linkedinIcon" style={style}>
      <title>Linkedin Icon</title>
      <linearGradient
        id="grad4"
        x1="0"
        x2="0"
        y1="26"
        y2="-2"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor={stopColor0} />
        <stop offset="1" stopColor={stopColor1} />
      </linearGradient>
      <path 
        d="M2,-1.5 25.5,-1.5 25.5,22 22,25.5 -1.5,25.5 -1.5,2 Z" 
        fill="url(#grad4)" 
        stroke="white" 
        strokeWidth="1"
        onMouseOver={() => setState({...state, mouseOver: true})}
        onMouseLeave={() => setState({...state, mouseOver: false, mouseDown: false})}
        onMouseDown={() => setState({...state, mouseDown: true})}
        onMouseUp={() => setState({...state, mouseDown: false})}
        onClick={() => window.open("https://linkedin.com/in/cameronhonis")}
      />
      <svg role="img" viewBox="-2 -2 32 32" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn icon</title><path pointerEvents="none" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    </svg>
  );
};