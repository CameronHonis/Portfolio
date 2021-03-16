import React from "react";
import { AppStateAction, AppStateActionType, AppState, Section } from "../App";

export interface Props {
  appState: AppState;
  appStateDispatch: React.Dispatch<AppStateAction>;
}

export interface Refs {
  projectsButton: React.MutableRefObject<HTMLButtonElement>;
  skillsButton: React.MutableRefObject<HTMLButtonElement>;
  contactButton: React.MutableRefObject<HTMLButtonElement>;
  interacts: {
    mouseOver: HTMLElement | undefined;
  }
}

export const initRefs: Refs = {
  projectsButton: React.createRef() as React.MutableRefObject<HTMLButtonElement>,
  skillsButton: React.createRef() as React.MutableRefObject<HTMLButtonElement>,
  contactButton: React.createRef() as React.MutableRefObject<HTMLButtonElement>,
  interacts: {
    mouseOver: undefined,
  },
}

export interface HeaderState {
  mouseOver: Element | undefined;
}

export const initState: HeaderState = {
  mouseOver: undefined,
}

export const Header: React.FC<Props> = ({ appState, appStateDispatch }) => {

  const [ headerState, setHeaderState ] = React.useState<HeaderState>(initState);
  let { current: refs } = React.useRef<Refs>(initRefs);

  React.useEffect(() => {
    if (appState.section === Section.Projects) {
      refs.projectsButton.current.style.borderColor = "rgba(255,150,60,1)";
      refs.projectsButton.current.style.background = "linear-gradient(0, rgba(255,150,60,.2), rgba(255,150,60,0))";
    } else if (headerState.mouseOver === refs.projectsButton.current) {
      refs.projectsButton.current.style.borderColor = "rgba(255,150,60,.3)";
      refs.projectsButton.current.style.background = "linear-gradient(0, rgba(255,150,60,0), rgba(255,150,60,0))";
    } else {
      refs.projectsButton.current.style.borderColor = "rgba(255,150,60,0)";
      refs.projectsButton.current.style.background = "linear-gradient(0, rgba(255,150,60,0), rgba(255,150,60,0))";
    }
    if (appState.section === Section.Skills) {
      refs.skillsButton.current.style.borderColor = "rgba(255,150,60,1)";
      refs.skillsButton.current.style.background = "linear-gradient(0, rgba(255,150,60,.2), rgba(255,150,60,0))";
    } else if (headerState.mouseOver === refs.skillsButton.current) {
      refs.skillsButton.current.style.borderColor = "rgba(255,150,60,.3)";
      refs.skillsButton.current.style.background = "linear-gradient(0, rgba(255,150,60,0), rgba(255,150,60,0))";
    } else {
      refs.skillsButton.current.style.borderColor = "rgba(255,150,60,0)";
      refs.skillsButton.current.style.background = "linear-gradient(0, rgba(255,150,60,0), rgba(255,150,60,0))";
    }
    if (appState.section === Section.Contact) {
      refs.contactButton.current.style.borderColor = "rgba(255,150,60,1)";
      refs.contactButton.current.style.background = "linear-gradient(0, rgba(255,150,60,.2), rgba(255,150,60,0))";
    } else if (headerState.mouseOver === refs.contactButton.current) {
      refs.contactButton.current.style.borderColor = "rgba(255,150,60,.3)";
      refs.contactButton.current.style.background = "linear-gradient(0, rgba(255,150,60,0), rgba(255,150,60,0))";
    } else {
      refs.contactButton.current.style.borderColor = "rgba(255,150,60,0)";
      refs.contactButton.current.style.background = "linear-gradient(0, rgba(255,150,60,0), rgba(255,150,60,0))";
    }

  },[appState.section, headerState.mouseOver]); //eslint-disable-line

  const mouseOver = (e: React.MouseEvent): void => {
    setHeaderState({...headerState, mouseOver: e.currentTarget as Element});
  }

  const mouseLeave = (e: React.MouseEvent): void => {
    if (headerState.mouseOver === e.target as Element) {
      setHeaderState({...headerState, mouseOver: undefined});
    }
  }

  const click = (e: React.MouseEvent, newSection: Section): void => {
    if (appState.section === newSection) { return; }
    appStateDispatch({type: AppStateActionType.SetSection, data: newSection});
  }

  return(
    <section id="header">
      <h1 >Cameron Honis</h1>
      <h3 >Software Engineer</h3>
      <button 
        id="projectsButton" 
        className="headerButton" 
        ref={refs.projectsButton}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => click(e, Section.Projects)}
      >Projects</button>
      <button 
        id="skillsButton" 
        className="headerButton" 
        ref={refs.skillsButton}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => click(e, Section.Skills)}
      >Skills</button>
      <button 
        id="contactButton" 
        className="headerButton" 
        ref={refs.contactButton}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => click(e, Section.Contact)}
      >Contact</button>
    </section>
  )
}