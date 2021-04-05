import React from "react";

interface Props {
  reff: React.MutableRefObject<SVGSVGElement>;
  mouseOver: (e: React.MouseEvent) => void;
  mouseLeave: (e: React.MouseEvent) => void;
  click: (e: React.MouseEvent) => void;
}

export const MenuHamburger: React.FC<Props> = ({ reff, mouseOver, mouseLeave, click }) => {

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      id="menuHamburger"
      ref={reff}
      onMouseOver={e => mouseOver(e)}
      onMouseLeave={e => mouseLeave(e)}
      onClick={e => click(e)}
      >
      <path
        style={{fill:"none",stroke:"#ffffff",strokeWidth:4,strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1}}
        d="M 12,2 2,12 12,22 88,22 98,12 88,2 Z"
        id="hamburger0"
      />
      <path
        style={{fill:"none",stroke:"#ffffff",strokeWidth:4,strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1}}
        d="m 12,40 -9.9999995,9.999999 9.9999995,10 h 75.999998 l 10,-10 -10,-9.999999 z"
        id="hamburger1"
      />
      <path
        style={{fill:"none",stroke:"#ffffff",strokeWidth:4,strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1}}
        d="m 12,78 -9.9999999,10 9.9999999,10 h 76 l 10,-10 -10,-10 z"
        id="hamburger2"
      />
    </svg>
  );
}