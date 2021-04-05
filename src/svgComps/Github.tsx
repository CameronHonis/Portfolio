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

export const Github: React.FC<Props> = ({ style }) => {
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
    <svg viewBox="-2 -2 28 28" xmlns="http://www.w3.org/2000/svg" className="social" id="githubIcon" style={style}>
      <title>GitHub icon</title>
      <linearGradient
        id="grad3"
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
        fill="url(#grad3)" 
        stroke="white" 
        strokeWidth="1"
        onMouseOver={() => setState({...state, mouseOver: true})}
        onMouseLeave={() => setState({...state, mouseOver: false, mouseDown: false})}
        onMouseDown={() => setState({...state, mouseDown: true})}
        onMouseUp={() => setState({...state, mouseDown: false})}
        onClick={() => window.open("https://github.com/cameronhonis")}
      />
      <path fill="rgba(0,0,0,1)" pointerEvents="none" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  );
};