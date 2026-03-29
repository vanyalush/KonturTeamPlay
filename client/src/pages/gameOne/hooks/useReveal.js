import gameState from "../../../store/GameState.js";
import {motivators_data} from "../data/MotivatorsData.jsx";

export const useReveal = (data, sessionId) => {
    let clickTimer = null;

    const revealHandler = () => {
        if(gameState.revealedCount < motivators_data.length) {
            gameState.revealNext();

            gameState.socket?.send(JSON.stringify({
                method: "revealedCard",
                sessionId,
                revealedCount: gameState.revealedCount
            }))
        }
    }
    const revealAllHandler = () => {
        gameState.revealAll(motivators_data.length);

        gameState.socket?.send(JSON.stringify({
            method: "revealAllCard",
            sessionId,
            totalCount: motivators_data.length
        }))
    }

    const handleClick = () => {
        clickTimer = setTimeout(() => {revealHandler(), 200})
    }
    const handleDoubleClick = () => {
        clearTimeout(clickTimer);
        revealAllHandler();
    };
    return { handleClick, handleDoubleClick }
}