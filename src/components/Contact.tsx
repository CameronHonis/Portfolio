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

  const contactHeight: number = appState.viewportSnappedSize.y - Math.max(60, .1*appState.viewportSnappedSize.x);
  const widthHeightRatio: number = appState.viewportSnappedSize.x / appState.viewportSnappedSize.y;
  const fontSize: number = Math.min(26, Math.max(17, .025*appState.viewportSnappedSize.x));
  const fontLineHeight: number = Math.max(1.5, 1 + .00022*appState.viewportSnappedSize.x);
  let frameWidth: number, frameHeight: number;
  let textLeft: number, textTop: number, cushionWidth: number, cushionHeight: number;
  let socialLeft: number, socialWidth: number;
  let emailRight: number, emailBottom: number, phoneRight: number, phoneBottom: number;
  if (widthHeightRatio > .8) {
    frameWidth = .2*appState.viewportSnappedSize.x;
    frameHeight = .3*appState.viewportSnappedSize.x;
    textLeft = .25*appState.viewportSnappedSize.x;
    textTop = .2*appState.viewportSnappedSize.x;
    cushionWidth = 0;
    cushionHeight = 0;
    socialLeft = .25*appState.viewportSnappedSize.x;
    socialWidth = .04*appState.viewportSnappedSize.x;
    emailRight = .3*appState.viewportSnappedSize.x;
    emailBottom = .02*appState.viewportSnappedSize.x;
    phoneRight = .02*appState.viewportSnappedSize.x;
    phoneBottom = .02*appState.viewportSnappedSize.x;
  } else {
    frameWidth = .4*appState.viewportSnappedSize.x;
    frameHeight = .6*appState.viewportSnappedSize.x;
    textLeft = .025*appState.viewportSnappedSize.x;
    textTop = .3*appState.viewportSnappedSize.x;
    cushionWidth = .45*appState.viewportSnappedSize.x;
    cushionHeight = (.65 - .2)*appState.viewportSnappedSize.x;
    socialLeft = .475*appState.viewportSnappedSize.x;
    socialWidth = .12*appState.viewportSnappedSize.x;
    emailRight = .02*appState.viewportSnappedSize.x;
    emailBottom = .02*appState.viewportSnappedSize.x;
    phoneRight = .02*appState.viewportSnappedSize.x;
    phoneBottom = .08*appState.viewportSnappedSize.x;
  }
  const social1Left = socialLeft + 1.75*socialWidth;
  const textWidth: number = appState.viewportSnappedSize.x - textLeft - 20;
  const textHeight: number = appState.viewportSnappedSize.y - textTop - 20;
  const emailFontSize: number = Math.max(17, .024*appState.viewportSnappedSize.x);
  return(
    <div id="contact" style={{height: contactHeight}}>
      <div id="avatarFrame" style={{width: frameWidth, height: frameHeight}}>
        <AvatarFrame />
        <AvatarFrame1 />
        <div id="avatar" />
      </div>
      <Github style={{left: socialLeft, width: socialWidth, height: socialWidth}} />
      <Linkedin style={{left: social1Left, width: socialWidth, height: socialWidth}} />
      <div id="about" style={{left: textLeft, top: textTop, width: textWidth, height: textHeight}}>
        <div style={{width: cushionWidth, height: cushionHeight}}></div>
        <p style={{fontSize, lineHeight: fontLineHeight}}>{appState.contactText}</p>
      </div>
      <p id="email" style={{fontSize: emailFontSize, right: emailRight, bottom: emailBottom}}>cameron‑04@hotmail.com</p>
      <p id="phone" style={{fontSize: emailFontSize, right: phoneRight, bottom: phoneBottom}}>440‑315‑3817</p>
    </div>
  );
}