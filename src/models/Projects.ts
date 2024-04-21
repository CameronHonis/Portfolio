import chessCagePng from "../img/chesscage1.png";
import pathingPng from "../img/project0e.png";
import shapes3dPng from "../img/project1b.png";

export interface Project {
    index: number;
    title: string;
    description: string;
    image: string;
    url: string;
    tags: string[];
}

export const Projects = [
    {
        index: 0,
        title: "ChessCage",
        description: "A website that hosts chess matches between humans and a powerful AI engine called Mila",
        image: chessCagePng,
        url: "https://chesscage.com",
        tags: ["React", "Go", "Microservices", "Websockets", "AI", "Kubernetes"],
    },
    {
        index: 1,
        title: "Pathing",
        description: "A search algorithm visualizer",
        image: pathingPng,
        url: "https://festive-easley-41b612.netlify.app/",
        tags: ["React", "Typescript", "Graph Theory"],
    },
    {
        index: 2,
        title: "Shapes 3D",
        description: "A hand-rolled, javascript based 3D render engine that draws shapes with divs",
        image: shapes3dPng,
        url: "https://priceless-noyce-a671fe.netlify.app/",
        tags: ["Raw Javascript", "Linear Algebra", "3D Graphics"],
    },
]