import React from "react";

export interface Props {
  reff?: React.MutableRefObject<SVGSVGElement>;
}

export const Circle2: React.FC<Props> = ({ reff }) => {

  return(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      id="circle2"
      className="circle"
      ref={reff}
    >
      <g>
        <ellipse
          className="circlePath"
          style={{fill:"#ff0000",fillRule:"evenodd"}}
          cx="50"
          cy="50"
          r="50" 
        />
        <path
          className="circlePath"
          style={{fill:"#ffffff",fillRule:"evenodd", width: 0, height: 0}}
          d="M 50.160156 0 C 32.52205 -0.05640297 16.159076 9.1845551 7.0996094 24.318359 L 11.390625 26.886719 C 14.1432 22.288262 
          17.695081 18.218482 21.878906 14.869141 L 25.003906 18.773438 C 32.077153 13.111002 40.863272 10.017716 49.923828 10 L 50 
          10 C 72.646579 11.625576 89.937755 27.063297 90 50 L 95 50 C 94.999822 47.907077 94.853634 45.816716 94.5625 43.744141 L 
          99.513672 43.048828 C 97.647025 29.750711 90.509772 17.76238 79.708984 9.7832031 L 76.736328 13.806641 C 73.715313 11.574538 
          70.426716 9.7294589 66.947266 8.3144531 L 68.830078 3.6816406 C 62.89984 1.2705611 56.561765 0.02071599 50.160156 0 z M 11.625 
          61.285156 L 2.03125 64.107422 A 50 50 0 0 0 28.681641 95.226562 L 32.945312 86.181641 A 40 40 0 0 1 11.625 61.285156 z " 
        />
      </g>
    </svg>
  );
}