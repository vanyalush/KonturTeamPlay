import Hero from "./pages/Hero.jsx";
import gameOne from "./pages/gameOne/GameOne.jsx";
import gameTwo from "./pages/gameTwo/GameTwo.jsx";
import gameThree from "./pages/gameThree/GameThree.jsx";
import {GAMEFOUR_ROUTE, GAMEONE_ROUTE, GAMETHREE_ROUTE, GAMETWO_ROUTE, MAIN_ROUTE} from "./utils/consts.js";
import {Navigate} from "react-router-dom";
import {generateGameId} from "./utils/genarateId.js";
import gameFour from "./pages/gameFour/GameFour.jsx";

const createLauncher = (gameRoute) => {
    return () => {
        const newId = generateGameId();
        return <Navigate to={`${gameRoute}/${newId}`} replace />;
    };
};

export const routes = [
    {
        path: MAIN_ROUTE,
        Component: Hero
    },
    {
        path: GAMEONE_ROUTE,
        Component: gameOne
    },
    {
        path: GAMETWO_ROUTE,
        Component: gameTwo
    },
    {
        path: GAMETHREE_ROUTE,
        Component: gameThree
    },
    {
        path: GAMEFOUR_ROUTE,
        Component: gameFour
    },
    {
        path: '/moving',
        Component: createLauncher('/moving')
    },
    {
        path: '/improv',
        Component: createLauncher('/improv')
    },
    {
        path: '/delegation',
        Component: createLauncher('/delegation')
    },
    {
        path: '/truths_lie',
        Component: createLauncher('/truths_lie')
    },
];