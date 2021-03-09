import React from "react";
import { Header } from "./Header";
import { Terrain } from "./Terrain";
import { Projects } from "./Projects";
import { TriEditor } from "./TriEditor";

export enum Section {
  Projects,
  Skills,
  Contact
}

export interface AppState {
  section: Section;
}

export const initAppState: AppState = {
  section: Section.Projects,
}

export const App: React.FC = () => {
  const [ appState, setAppState ] = React.useState<AppState>(initAppState);
  return(
    <>
      <Header appState={appState} setAppState={setAppState} />
      { true && <Terrain />}
      {
        false && appState.section === Section.Projects &&
        <Projects appState={appState} setAppState={setAppState} />
      }
      {false && <TriEditor />}
    </>
  );
}