import React from "react";

export const AvatarFrame: React.FC<{}> = () => {
  return(
    <svg
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      style={{position: "absolute"}}
    >
      <linearGradient
        x1="0"
        x2="0"
        y1="150"
        y2="0"
        gradientUnits="userSpaceOnUse"
        id="grad0"
      >
        <stop offset="0" stopColor="rgba(0,20,10,.5)" />
        <stop offset="1" stopColor="rgba(0,50,30,.5)" />
      </linearGradient>
      <path d="M 13,2 87,2 98,13 98,137 87,148 13,148 2,137 2,13 Z" fill="url(#grad0)" strokeWidth="1" stroke="white" />
      <path d="M 10,5 10,145" strokeWidth=".25" stroke="white" />
      <path d="M 20,2 20,148" strokeWidth=".25" stroke="white" />
      <path d="M 30,2 30,148" strokeWidth=".25" stroke="white" />
      <path d="M 40,2 40,148" strokeWidth=".25" stroke="white" />
      <path d="M 50,2 50,148" strokeWidth=".25" stroke="white" />
      <path d="M 60,2 60,148" strokeWidth=".25" stroke="white" />
      <path d="M 70,2 70,148" strokeWidth=".25" stroke="white" />
      <path d="M 80,2 80,148" strokeWidth=".25" stroke="white" />
      <path d="M 90,5 90,145" strokeWidth=".25" stroke="white" />

      <path d="M 5,10 95,10" strokeWidth=".25" stroke="white" />
      <path d="M 2,20 98,20" strokeWidth=".25" stroke="white" />
      <path d="M 2,30 98,30" strokeWidth=".25" stroke="white" />
      <path d="M 2,40 98,40" strokeWidth=".25" stroke="white" />
      <path d="M 2,50 98,50" strokeWidth=".25" stroke="white" />
      <path d="M 2,60 98,60" strokeWidth=".25" stroke="white" />
      <path d="M 2,70 98,70" strokeWidth=".25" stroke="white" />
      <path d="M 2,80 98,80" strokeWidth=".25" stroke="white" />
      <path d="M 2,90 98,90" strokeWidth=".25" stroke="white" />
      <path d="M 2,100 98,100" strokeWidth=".25" stroke="white" />
      <path d="M 2,110 98,110" strokeWidth=".25" stroke="white" />
      <path d="M 2,120 98,120" strokeWidth=".25" stroke="white" />
      <path d="M 2,130 98,130" strokeWidth=".25" stroke="white" />
      <path d="M 5,140 95,140" strokeWidth=".25" stroke="white" />
    </svg>
  );
}