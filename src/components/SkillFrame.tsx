import React from "react";
import gsap from "gsap";
import { SkillOutline } from "../svgComps/SkillOutline";
import { Refs, SkillCategory } from "./Skills";

export interface Props {
  reff: React.MutableRefObject<HTMLDivElement>;
  idx: number;
  groupIdx: number;
  skillsRefs: Refs;
}

export const SkillFrame: React.FC<Props> = ({ reff, idx, skillsRefs, groupIdx }) => {

  React.useEffect(() => {
    reff.current.style.opacity = "0";
    gsap.killTweensOf(reff.current, "opacity");
    gsap.to(reff.current, {opacity: 1, delay: .05*groupIdx});
  }, []); //eslint-disable-line
  
  const headerHeight: number = .1*window.innerWidth;
  const bodyHeight: number = window.innerHeight - headerHeight;
  let skillOutlineLeft: string;
  if (skillsRefs.skills[idx].cat === SkillCategory.Languages) {
    skillOutlineLeft = window.innerWidth/6 + "px";
  } else if (skillsRefs.skills[idx].cat === SkillCategory.Frameworks) {
    skillOutlineLeft = window.innerWidth/2 + "px";
  } else if (skillsRefs.skills[idx].cat === SkillCategory.Other) {
    skillOutlineLeft = 5*window.innerWidth/6 + "px";
  } else { throw new Error(); }
  const skillOutlineTop: string = (groupIdx+2)*.115*bodyHeight + "px";
  return(
    <div id="skillFrame" ref={reff} style={{opacity: 0, left: skillOutlineLeft, top: skillOutlineTop}}>
      {skillsRefs.skills[idx].iconSVG}
      <SkillOutline style={{}} />
      <p>{skillsRefs.skills[idx].name}</p>
    </div>
  );
}