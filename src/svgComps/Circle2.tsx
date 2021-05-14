import React from "react";

export interface Props {
  reff?: React.MutableRefObject<SVGSVGElement>;
}

export const Circle2: React.FC<Props> = ({ reff }) => {

  return(
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      ref={reff}
      className="circle"
    >
      <g>
        <path
          style={{fill:"none",fillOpacity:1,fillRule:"evenodd",stroke:"#ffffff",strokeOpacity:1,strokeWidth:1.5,strokeMiterlimit:4,strokeDasharray:"none"}}
          d="M 50.056641 2.6269531 A 47.5 47.5 0 0 0 11.070312 23.091797 L 14.214844 25.267578 A 43.5 43.5 0 0 1 23.019531 15.876953 L 25.810547 19.408203 A 39 39 0 0 1 50 11 A 39 39 0 0 1 89 50 A 39 39 0 0 1 88.216797 57.771484 L 92.724609 58.6875 A 43.599998 43.599998 0 0 0 93.5625 51.775391 L 97.591797 51.927734 A 47.5 47.5 0 0 0 84.572266 17.419922 L 81.730469 20.099609 A 43.599998 43.599998 0 0 0 72.833984 12.857422 A 43.599998 43.599998 0 0 0 61.269531 7.8828125 L 62.255859 4.2011719 A 47.5 47.5 0 0 0 50.056641 2.6269531 z " />
        <path
          style={{fill:"none",fillRule:"evenodd",fillOpacity:1,stroke:"#ffffff",strokeOpacity:1,strokeWidth:1.5,strokeMiterlimit:4,strokeDasharray:"none"}}
          d="M 6.6601562 53.705078 L 2.1738281 54.087891 A 48 48 0 0 0 17.654297 85.464844 L 20.621094 82.212891 A 43.599998 43.599998 0 0 0 36.001953 91.291016 L 37.478516 86.933594 A 39 39 0 0 1 11.634766 57.005859 L 7.2089844 57.814453 A 43.5 43.5 0 0 1 6.6601562 53.705078 z " />
      </g>
    </svg>
  );
}