import React from "react";
import { AppStateAction, AppStateActionType, AppState, Section } from "../App";
import { HeaderButton0 } from "../svgComps/HeaderButtons";
import { MenuHamburger } from "../svgComps/MenuHamburger";

export interface Props {
  appState: AppState;
  appStateDispatch: React.Dispatch<AppStateAction>;
}

export interface Refs {
  projectsButton: React.MutableRefObject<HTMLButtonElement>;
  skillsButton: React.MutableRefObject<HTMLButtonElement>;
  contactButton: React.MutableRefObject<HTMLButtonElement>;
  headerButtons: React.MutableRefObject<HTMLDivElement>;
  headerButtonsExit: React.MutableRefObject<HTMLDivElement>;
  hamburger: React.MutableRefObject<SVGSVGElement>;
  interacts: {
    mouseOver: HTMLElement | undefined;
  }
}

export const initRefs: Refs = {
  projectsButton: React.createRef() as React.MutableRefObject<HTMLButtonElement>,
  skillsButton: React.createRef() as React.MutableRefObject<HTMLButtonElement>,
  contactButton: React.createRef() as React.MutableRefObject<HTMLButtonElement>,
  headerButtons: React.createRef() as React.MutableRefObject<HTMLDivElement>,
  headerButtonsExit: React.createRef() as React.MutableRefObject<HTMLDivElement>,
  hamburger: React.createRef() as React.MutableRefObject<SVGSVGElement>,
  interacts: {
    mouseOver: undefined,
  },
}

export interface HeaderState {
  mouseOver: Element | undefined;
  optionsCondensed: boolean;
  hamburgerExpanded: boolean;
}

export const initState: HeaderState = {
  mouseOver: undefined,
  optionsCondensed: window.innerWidth < 700,
  hamburgerExpanded: false,
}

export const Header: React.FC<Props> = ({ appState, appStateDispatch }) => {

  const [ headerState, setHeaderState ] = React.useState<HeaderState>(initState);
  let { current: refs } = React.useRef<Refs>(initRefs);
  //Reactive
  React.useEffect(() => {
    if (!headerState.optionsCondensed) {
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
    } else {
      if (refs.hamburger.current) {
        const ham0: SVGPathElement | null = refs.hamburger.current.querySelector("#hamburger0");
        const ham1: SVGPathElement | null = refs.hamburger.current.querySelector("#hamburger1");
        const ham2: SVGPathElement | null = refs.hamburger.current.querySelector("#hamburger2");
        if (ham0 && ham1 && ham2) {
          if (headerState.hamburgerExpanded) {
            ham0.style.fill = "rgb(255,255,255)";
            ham1.style.fill = "rgb(255,255,255)";
            ham2.style.fill = "rgb(255,255,255)";
          } else if (headerState.mouseOver === refs.hamburger.current) {
            ham0.style.fill = "rgba(255,255,255,.5)";
            ham1.style.fill = "rgba(255,255,255,.5)";
            ham2.style.fill = "rgba(255,255,255,.5)";
          } else {
            ham0.style.fill = "rgba(255,255,255,0)";
            ham1.style.fill = "rgba(255,255,255,0)";
            ham2.style.fill = "rgba(255,255,255,0)";
          }
        }
      }
      if (headerState.hamburgerExpanded) {
        refs.headerButtons.current.style.visibility = "initial";
        refs.headerButtonsExit.current.style.visibility = "initial";
        if (appState.section === Section.Projects) {
          refs.projectsButton.current.style.color = "rgb(255,255,255)";
          refs.projectsButton.current.style.cursor = "default";
        } else if (headerState.mouseOver === refs.projectsButton.current) {
          refs.projectsButton.current.style.color = "rgb(170,170,170)";
          refs.projectsButton.current.style.cursor = "pointer";
        } else {
          refs.projectsButton.current.style.color = "rgb(100,100,100)";
          refs.projectsButton.current.style.cursor = "pointer";
        }
        if (appState.section === Section.Skills) {
          refs.skillsButton.current.style.color = "rgb(255,255,255)";
          refs.skillsButton.current.style.cursor = "default";
        } else if (headerState.mouseOver === refs.skillsButton.current) {
          refs.skillsButton.current.style.color = "rgb(170,170,170)";
          refs.skillsButton.current.style.cursor = "pointer";
        } else {
          refs.skillsButton.current.style.color = "rgb(100,100,100)";
          refs.skillsButton.current.style.cursor = "pointer";
        }
        if (appState.section === Section.Contact) {
          refs.contactButton.current.style.color = "rgb(255,255,255)";
          refs.contactButton.current.style.cursor = "default";
        } else if (headerState.mouseOver === refs.contactButton.current) {
          refs.contactButton.current.style.color = "rgb(170,170,170)";
          refs.contactButton.current.style.cursor = "pointer";
        } else {
          refs.contactButton.current.style.color = "rgb(100,100,100)";
          refs.contactButton.current.style.cursor = "pointer";
        }
      } else {
        refs.headerButtons.current.style.visibility = "hidden";
        refs.headerButtonsExit.current.style.visibility = "hidden";
      }
    }
  },[appState.section, headerState.mouseOver, headerState.optionsCondensed, headerState.hamburgerExpanded]); //eslint-disable-line

  React.useEffect(() => {
    const widthHeightRatio: number = appState.viewportSnappedSize.x / appState.viewportSnappedSize.y;
    if (widthHeightRatio < .8 && !headerState.optionsCondensed) {
      setHeaderState({...headerState, optionsCondensed: true});
    } else if (widthHeightRatio > .8 && headerState.optionsCondensed) {
      setHeaderState({...headerState, optionsCondensed: false});
    }
  }, [appState.viewportSnappedSize.x]); //eslint-disable-line
  //End - Reactive

  //Functional
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

  const hamburgerClick = (e: React.MouseEvent): void => {
    setHeaderState({...headerState, hamburgerExpanded: !headerState.hamburgerExpanded});
  }
  //End - Functional
  
  //Dynamic styling
  const headerHeight: number = Math.max(60, .1*appState.viewportSnappedSize.x);
  const h1Height: number = Math.max(27, .045*appState.viewportSnappedSize.x);
  const h1Left: number =  Math.max(6, .01*appState.viewportSnappedSize.x);
  const h1Top: number = Math.max(6, .01*appState.viewportSnappedSize.x);
  const h3Height: number = Math.max(12, .02*appState.viewportSnappedSize.x);
  const h3Left: number = Math.max(90, .15*appState.viewportSnappedSize.x);
  const h3Top: number = Math.max(39, .065*appState.viewportSnappedSize.x);
  const headerOptions: JSX.Element[] = [];
  if (headerState.optionsCondensed) {
    headerOptions.push(
      <MenuHamburger key={0} reff={refs.hamburger} mouseOver={mouseOver} mouseLeave={mouseLeave} click={hamburgerClick}/>,
      <HeaderButton0 
        key={1} 
        appState={appState}
        projectsRef={refs.projectsButton}
        skillsRef={refs.skillsButton}
        contactRef={refs.contactButton}
        headerButtonsRef={refs.headerButtons}
        exitRef={refs.headerButtonsExit}
        mouseOver={mouseOver}
        mouseLeave={mouseLeave}
        click={click}
        exit={hamburgerClick}
      />,
    );
  } else { // !headerState.optionsCondensed
    headerOptions.push(
      <button 
        id="projectsButton" 
        className="headerButton" 
        ref={refs.projectsButton}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => click(e, Section.Projects)}
        key={0}
      >Projects</button>,
      <button 
        id="skillsButton" 
        className="headerButton" 
        ref={refs.skillsButton}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => click(e, Section.Skills)}
        key={1}
      >Skills</button>,
      <button 
        id="contactButton" 
        className="headerButton" 
        ref={refs.contactButton}
        onMouseOver={e => mouseOver(e)}
        onMouseLeave={e => mouseLeave(e)}
        onClick={e => click(e, Section.Contact)}
        key={2}
      >Contact</button>
    );
  }
  //End - Dynamic styling

  return(
    <section id="header" style={{height: headerHeight}}>
      <h1 style={{fontSize: h1Height, left: h1Left, top: h1Top}} >Cameron Honis</h1>
      <h3 style={{fontSize: h3Height, left: h3Left, top: h3Top}} >Software Engineer</h3>
      {headerOptions}
    </section>
  )
}