import React from "react";

export interface Props {
  reff?: React.MutableRefObject<SVGSVGElement>;
}

export const Circle4: React.FC<Props> = ({ reff }) => {

  return(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      id="circle4"
      className="circle"
      ref={reff}
    >
      <path
        className="circlePath"
        style={{fill:"#ffffff",fillRule:"evenodd",fillOpacity:1, width: 0, height: 0}}
        d="M 49.775391 0 A 50 50 0 0 0 25.335938 6.5058594 A 50 50 0 0 0 2.9277344 66.857422 A 50 50 0 0 0 58.554688 
        99.261719 A 50 50 0 0 0 100 50 L 98 50 A 48 48 0 0 1 50 98 A 48 48 0 0 1 2 50 A 48 48 0 0 1 50 2 A 48 48 0 0 1 
        87.085938 19.527344 L 88.632812 18.257812 A 50 50 0 0 0 49.775391 0 z " 
      />
    </svg>
  )
}