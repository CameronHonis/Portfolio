import React from "react";

export interface Props {
  reff?: React.MutableRefObject<SVGSVGElement>;
  pathStyle?: Object;
}

export const Circle1: React.FC<Props> = ({ reff, pathStyle={} }) => {

  return(
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      ref={reff}
      className="circle"
    >
      <path
        style={{fill:"#ffffff",fillRule:"evenodd",stroke:"none",fillOpacity:1}}
        d="M 49.947266 0 A 50 50 0 0 0 0 50 A 50 50 0 0 0 50 100 A 50 50 0 0 0 64.693359 97.791016 L 62.636719 91.099609 A 43 43 0 0 1 50 93 A 43 43 0 0 1 7 50 A 43 43 0 0 1 50 7 A 43 43 0 0 1 93 50 L 100 50 A 50 50 0 0 0 50 0 A 50 50 0 0 0 49.947266 0 z " />
    </svg>
  );
}