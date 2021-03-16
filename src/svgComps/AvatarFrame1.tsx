import React from "react";

export const AvatarFrame1: React.FC<{}> = () => {
  return(
    <svg
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      style={{position: "absolute", zIndex: 3}}
    >
      <linearGradient
        x1="0"
        x2="0"
        y1="150"
        y2="0"
        gradientUnits="userSpaceOnUse"
        id="grad1"
      >
        <stop offset="0" stopColor="rgb(100,100,100)" />
        <stop offset=".05" stopColor="rgb(220,220,220)" />
        <stop offset=".95" stopColor="rgb(220,220,220)" />
        <stop offset="1" stopColor="rgb(150,150,150)" />
      </linearGradient>
      <path d="M 2,35 2,13 13,2 35,2" strokeWidth="5" stroke="url(#grad1)" fill="none" />
      <path d="M 65,148 87,148 98,137 98,115" strokeWidth="5" stroke="url(#grad1)" fill="none" />
    </svg>
  );
}