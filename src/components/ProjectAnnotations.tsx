import React from "react";
import {AppState} from "../App";
import {V2} from "../models/V2";
import {Refs as ProjectsRefs, State as ProjectsState} from "./ProjectsFC";
import {Projects} from "../models/Projects";

export interface Props {
    projectsState: ProjectsState;
    projectsRefs: ProjectsRefs;
    appState: AppState;
}

export interface AnnotationReactRefs {
    circleRef: React.MutableRefObject<SVGEllipseElement>;
    lineRef: React.MutableRefObject<SVGPathElement>;
    textRef: React.MutableRefObject<HTMLParagraphElement>;
}

const wideScreenLineStarts: V2[] = [
    new V2(.25, .175),
    new V2(.75, .175),
    new V2(.275, .45),
    new V2(.725, .35),
    new V2(.275, .65),
    new V2(.725, .65),
];

const narrowScreenLineStarts: V2[] = [
    new V2(.18, .275),
    new V2(.82, .275),
    new V2(.205, .425),
    new V2(.795, .425),
    new V2(.205, .65),
    new V2(.795, .65),
];

const wideScreenLineJoints: V2[] = [
    new V2(.3, .175),
    new V2(.7, .175),
    new V2(.325, .45),
    new V2(.675, .35),
    new V2(.325, .65),
    new V2(.675, .65)
];

const narrowScreenLineJoints: V2[] = [
    new V2(.23, .275),
    new V2(.77, .275),
    new V2(.255, .425),
    new V2(.745, .425),
    new V2(.255, .65),
    new V2(.745, .65),
];

const lineEndRelProjectScreens: V2[] = [
    new V2(-.4, -.4),
    new V2(.35, -.4),
    new V2(-.4, -.075),
    new V2(.4, -.15),
    new V2(-.4, .3),
    new V2(.4, .3),
];

export const ProjectAnnotations: React.FC<Props> = ({projectsState, projectsRefs, appState}) => {

    projectsRefs.annotations = [];
    const annotationSVGs: JSX.Element[] = [];
    const annotations: JSX.Element[] = [];
    const widthHeightRatio: number = appState.viewportSnappedSize.x / appState.viewportSnappedSize.y;
    const circleRY: number = .5 * appState.viewportSnappedSize.x / (appState.viewportSnappedSize.y - .1 * appState.viewportSnappedSize.x);
    const getReactRefs = (): AnnotationReactRefs => {
        return {
            circleRef: React.createRef() as React.MutableRefObject<SVGEllipseElement>,
            lineRef: React.createRef() as React.MutableRefObject<SVGPathElement>,
            textRef: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
        };
    }

    const tagIdxOffset = Math.floor(Math.random() * 6);
    for (const [tagIdxStr, tag] of Object.entries(Projects[projectsState.projectIndex].tags)) {
        const tagIdx = (Number.parseInt(tagIdxStr) + tagIdxOffset) % 6;
        projectsRefs.annotations.push({
            ...getReactRefs(),
            lineStart: widthHeightRatio > 1.5 ? wideScreenLineStarts[tagIdx] : narrowScreenLineStarts[tagIdx],
            lineBend: widthHeightRatio > 1.5 ? wideScreenLineJoints[tagIdx] : narrowScreenLineJoints[tagIdx],
            lineEndRelProjectScreen: lineEndRelProjectScreens[tagIdx],
            text: tag,
        });
    }

    for (const annotation of projectsRefs.annotations) {
        annotationSVGs.push(
            <svg
                viewBox="0 0 100 100"
                width="100"
                height="100"
                className="annotationSVG"
                preserveAspectRatio="none"
                key={annotationSVGs.length}
            >
                <ellipse
                    rx=".5"
                    ry={circleRY.toString()}
                    ref={annotation.circleRef}
                />
                <path
                    ref={annotation.lineRef}
                />
            </svg>
        );
        const textTransform: string = "translate(" + (annotation.lineStart.x > .5 ? "0" : "-100%") + ",-50%";
        const padding: ["paddingLeft" | "paddingRight", string]
            = annotation.lineStart.x > .5 ? ["paddingRight", "20px"] : ["paddingLeft", "20px"];
        annotations.push(
            <p
                className="annotation"
                ref={annotation.textRef}
                key={annotations.length}
                style={{
                    transform: textTransform,
                    WebkitTransform: textTransform,
                    OTransform: textTransform,
                    msTransform: textTransform,
                    ["MozTransform" as any]: textTransform,
                    [padding[0]]: padding[1],
                }}
            >{annotation.text}</p>
        );
    }
    return (
        <div id="annotations">
            {annotationSVGs}
            {annotations}
        </div>
    );
}