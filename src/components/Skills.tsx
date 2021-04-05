import React from "react";
import { Blender } from "../svgComps/Blender";
import { GIMP } from "../svgComps/GIMP";
import { GitIcon } from "../svgComps/GitIcon";
import { Graphql } from "../svgComps/Graphql";
import { Heroku } from "../svgComps/Heroku";
import { HtmlCssJSIcon } from "../svgComps/HtmlCssJSIcon";
import { Inkscape } from "../svgComps/Inkscape";
import { Java } from "../svgComps/Java";
import { Lua } from "../svgComps/Lua";
import { MongoDB } from "../svgComps/MongoDB";
import { NodeJS } from "../svgComps/NodeJS";
import { Postgresql } from "../svgComps/Postgresql";
import { Python } from "../svgComps/Python";
import { ReactIcon } from "../svgComps/ReactIcon";
import { Redux } from "../svgComps/Redux";
import { SkillTitleOutline } from "../svgComps/SkillTitleOutline";
import { Springio } from "../svgComps/Springio";
import { SQL } from "../svgComps/SQL";
import { Typescript } from "../svgComps/Typescript";
import { SkillFrame } from "./SkillFrame";
import { OpenGL } from "../svgComps/OpenGL";

export enum SkillCategory {
  Languages,
  Frameworks,
  Other,
}

export interface Skill {
  name: string;
  cat: SkillCategory;
  ref: React.MutableRefObject<HTMLDivElement>;
  iconSVG?: JSX.Element;
}

export interface Refs {
  skills: Skill[];
}

export const initRefs: Refs = {
  skills: [
    {
      name: "HTML/CSS/JS",
      cat: SkillCategory.Languages,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <HtmlCssJSIcon />,
    },
    {
      name: "Typescript",
      cat: SkillCategory.Languages,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Typescript />,
    },
    {
      name: "Java",
      cat: SkillCategory.Languages,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Java />,
    },
    {
      name: "Python",
      cat: SkillCategory.Languages,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Python />,
    },
    {
      name: "SQL",
      cat: SkillCategory.Languages,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <SQL />,
    },
    {
      name: "GraphQL",
      cat: SkillCategory.Languages,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Graphql />,
    },
    {
      name: "Lua",
      cat: SkillCategory.Languages,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Lua />,
    },
    {
      name: "React",
      cat: SkillCategory.Frameworks,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <ReactIcon />,
    },
    {
      name: "Redux",
      cat: SkillCategory.Frameworks,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Redux />,
    },
    {
      name: "OpenGL",
      cat: SkillCategory.Frameworks,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <OpenGL/>,
    },
    {
      name: "Spring",
      cat: SkillCategory.Frameworks,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Springio />,
    },
    {
      name: "Node/Express",
      cat: SkillCategory.Frameworks,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <NodeJS />,
    },
    {
      name: "PostgreSQL",
      cat: SkillCategory.Frameworks,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Postgresql />,
    },
    {
      name: "MongoDB",
      cat: SkillCategory.Frameworks,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <MongoDB />,
    },
    {
      name: "Git/Github",
      cat: SkillCategory.Other,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <GitIcon />,
    },
    {
      name: "Heroku",
      cat: SkillCategory.Other,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Heroku />,
    },
    {
      name: "Inkscape",
      cat: SkillCategory.Other,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Inkscape />,
    },
    {
      name: "GIMP",
      cat: SkillCategory.Other,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <GIMP />,
    },
    {
      name: "Blender",
      cat: SkillCategory.Other,
      ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      iconSVG: <Blender />
    },
  ],
}

export const Skills: React.FC<{}> = () => {
  let { current: refs } = React.useRef<Refs>(initRefs);

  const languagesComps: JSX.Element[] = [];
  const frameworksComps: JSX.Element[] = [];
  const otherComps: JSX.Element[] = [];
  for (let i = 0; i < refs.skills.length; ++i) {
    const skill: Skill = refs.skills[i];
    if (skill.cat === SkillCategory.Languages) {
      languagesComps.push(<SkillFrame reff={skill.ref} idx={i} groupIdx={languagesComps.length} skillsRefs={refs} key={i} />);
    } else if (skill.cat === SkillCategory.Frameworks) {
      frameworksComps.push(<SkillFrame reff={skill.ref} idx={i} groupIdx={frameworksComps.length} skillsRefs={refs} key={i} />);
    } else if (skill.cat === SkillCategory.Other) {
      otherComps.push(<SkillFrame reff={skill.ref} idx={i} groupIdx={otherComps.length} skillsRefs={refs} key={i} />);
    }
  }
  return (
    <div id="skills" >
      <SkillTitleOutline style={{left: "16.6vw"}} />
      <h4 id="languagesTitle" className="skillsTitle" >Languages</h4>
      <div id="languages" >
        {languagesComps}
      </div>
      <SkillTitleOutline style={{left: "50vw"}} />
      <h4 id="frameworksTitle" className="skillsTitle" >Frameworks</h4>
      <div id="frameworks" >
        {frameworksComps}
      </div>
      <SkillTitleOutline style={{left: "83.4vw"}} />
      <h4 id="otherTitle" className="skillsTitle" >Other</h4>
      <div id="other" >
        {otherComps}
      </div>
    </div>
  );
}