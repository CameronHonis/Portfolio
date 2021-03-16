import React from "react";
import { Header } from "./components/Header";
import { Terrain } from "./components/Terrain";
import { Projects } from "./components/Projects";
import { TriEditor } from "./TriEditor";
import { V2 } from "./models/V2";
import { Skills } from "./components/Skills";
import { Contact } from "./components/Contact";

export enum Section {
  Projects,
  Skills,
  Contact
}

export interface AppState {
  section: Section;
  viewportSnappedSize: V2;
  contactText: string;
  introFinished: boolean;
}

export const initAppState: AppState = {
  section: Section.Projects,
  viewportSnappedSize: new V2(window.innerWidth, window.innerHeight),
  contactText: "",
  introFinished: false,
}

export interface AppRefs {
}

export const initAppRefs: AppRefs = {
}

export enum AppStateActionType {
  Resize,
  SetSection,
  SetContactText,
  SetIntroFinished,
}

export interface AppStateAction {
  type: AppStateActionType;
  data?: any;
}

const appStateReducer: React.Reducer<AppState, AppStateAction> = (last, action): AppState => {
  if (action.type === AppStateActionType.Resize && action.data instanceof V2) {
    if (Math.abs(last.viewportSnappedSize.x - window.innerWidth) > 10
    || Math.abs(last.viewportSnappedSize.y - window.innerHeight) > 10) {
      return {...last, viewportSnappedSize: action.data};  
    } else {
      return last;
    }
  } else if (action.type === AppStateActionType.SetSection && action.data in Section) {
    if (!last.introFinished) { return last; }
    return {...last, section: action.data};
  } else if (action.type === AppStateActionType.SetContactText && typeof action.data === "string") {
    return {...last, contactText: action.data};
  } else if (action.type === AppStateActionType.SetIntroFinished && typeof action.data === "boolean") {
    return {...last, introFinished: action.data};
  } else {
    throw new Error("Unhandled parameter type 'action': " + action);
  }
}

export const App: React.FC = () => {
  let { current: refs } = React.useRef<AppRefs>(initAppRefs); //eslint-disable-line
  const [ appState, appStateDispatch ] = React.useReducer(appStateReducer, initAppState);

  React.useEffect(() => {
    window.addEventListener("resize", () => {
      appStateDispatch({type: AppStateActionType.Resize, data: new V2(window.innerWidth, window.innerHeight)});
    });
    setTimeout(() => {
      appStateDispatch({type: AppStateActionType.SetIntroFinished, data: true});
    },3000);
  },[]); //eslint-disable-line

  let bodyComp: JSX.Element;
  if (appState.section === Section.Projects) {
    bodyComp = <Projects appState={appState} appStateDispatch={appStateDispatch} />;
  } else if (appState.section === Section.Skills) {
    bodyComp = <Skills />;
  } else if (appState.section === Section.Contact) {
    bodyComp = <Contact appState={appState} appStateDispatch={appStateDispatch} />;
  } else { throw new Error(); }

  return(
    <>
      <Header appState={appState} appStateDispatch={appStateDispatch} />
      { true && <Terrain appState={appState} />}
      {bodyComp}
      {false && <TriEditor />}
    </>
  );
}