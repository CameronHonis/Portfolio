import React from "react";
import { AppState, Section } from "../App";

interface Props {
  appState: AppState;
  projectsRef: React.MutableRefObject<HTMLButtonElement>;
  skillsRef: React.MutableRefObject<HTMLButtonElement>;
  contactRef: React.MutableRefObject<HTMLButtonElement>;
  headerButtonsRef: React.MutableRefObject<HTMLDivElement>;
  exitRef: React.MutableRefObject<HTMLDivElement>;
  mouseOver: (e: React.MouseEvent) => void;
  mouseLeave: (e: React.MouseEvent) => void;
  click: (e: React.MouseEvent, newSection: Section) => void;
  exit: (e: React.MouseEvent) => void;
}

export const HeaderButton0: React.FC<Props> = ({ appState, projectsRef, skillsRef, contactRef, headerButtonsRef, exitRef, mouseOver, mouseLeave, click, exit }) => {
  

  const headerHeight: number = Math.max(60, .1*appState.viewportSnappedSize.x);
  const exitHeight: number = .75*appState.viewportSnappedSize.y - headerHeight;
  return(
    <>
    <div 
      id="headerButtons"
      style={{top: headerHeight}}
      ref={headerButtonsRef}
    >
      <button
        className="noselect"
        ref={projectsRef}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => {
          click(e, Section.Projects);
          exit(e);
        }}
      >projects</button>
      <button
        className="noselect"
        ref={skillsRef}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => {
          click(e, Section.Skills);
          exit(e);
        }}
      >skills</button>
      <button
        className="noselect"
        ref={contactRef}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => {
          click(e, Section.Contact);
          exit(e);
        }}
      >contact</button>
    </div>
    <div
      id="headerButtonsExit"
      style={{height: exitHeight}}
      onClick={e => exit(e)}
      ref={exitRef}
    ></div>
    </>
  );
}