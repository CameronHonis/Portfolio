import React from "react";
import gsap from "gsap";
import { AppState, AppStateAction, AppStateActionType } from "../App";
import { AvatarFrame } from "../svgComps/AvatarFrame";
import { AvatarFrame1 } from "../svgComps/AvatarFrame1";
import { Github } from "../svgComps/Github";
import { Linkedin } from "../svgComps/Linkedin";

const textToRender: string = `Welcome to my portfolio page. I would like to tell you a bit about my journey in software 
engineering so far. I started off putting in work as an indie game developer. I just considered this a hobby, and had my sights set on 
chemical engineering. That was until one day when I realized my interest in coding was too strong to pass off as a hobby. I have high 
expectations for myself and I look forward to exploring many other facets of software engineering, such as: web dev, blockchain 
technologies, and applied machine learning. I have a particular interest in mathematics and optimizing algorithms. I am currently open for work;
do not hesitate to reach out if you think I would be a good fit for your company. I look forward to hearing from you.`

export interface Props {
  appState: AppState;
  appStateDispatch: React.Dispatch<AppStateAction>;
}

export interface Refs {
  textRendered: string,
}

export const Contact: React.FC<Props> = ({ appState, appStateDispatch }) => {
  React.useEffect(() => {
    gsap.fromTo("#avatar", {opacity: 0}, {opacity: 1});
  }, []);

  React.useEffect(() => {
    const nextIdx: number = appState.contactText.length;
    if (nextIdx >= textToRender.length) { return; }
    const nextStr: string = textToRender.charAt(nextIdx);
    setTimeout(() => {
      appStateDispatch({type: AppStateActionType.SetContactText, data: appState.contactText + nextStr});
    }, appState.contactText.charAt(appState.contactText.length - 1) === "." ? 200 : 8);
  },[appStateDispatch, appState.contactText]);

  return(
    <div id="contact">
      <div id="avatarFrame">
        <AvatarFrame />
        <AvatarFrame1 />
        <div id="avatar" />
      </div>
      <Github />
      <Linkedin />
      <p id="about">{appState.contactText}</p>
    </div>
  );
}