import React, {useEffect, useState} from 'react';
import gameState from "../../store/GameState.js";

const ImprovCard = ({img, isBlind, id}) => {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        if(!gameState.socket) return;

        const handler = (e) => {
            const msg = JSON.parse(e.data);
            if(msg.method === "syncRevealed" && msg.cardId === id) {
                setFlipped(true);
            }
        }

        gameState.socket.addEventListener("message", handler);
        return () => {gameState.socket.removeEventListener("message", handler);}
    }, [gameState.socket]);

    useEffect(() => {
        setFlipped(false);
    }, [isBlind])

    const handleClick = () => {
        if (!isBlind) return;
        const newFlipped = !flipped;
        setFlipped(newFlipped);

        if (newFlipped && gameState.socket?.readyState === WebSocket.OPEN) {
            gameState.socket.send(JSON.stringify({
                method: "revealedCard",
                sessionId: gameState.sessionId,
                cardId: id,
            }));
        }
    };
    return (
        <div
            onClick={handleClick}
            className="w-[188px] h-[121px] cursor-pointer"
            style={{ perspective: "600px" }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    transition: "transform 0.5s",
                    transformStyle: "preserve-3d",
                    transform: isBlind && !flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    position: "relative",
                }}
            >
                <div
                    style={{ backfaceVisibility: "hidden" }}
                    className="absolute inset-0 p-[2px] rounded-lg bg-gradient-to-r from-[#a97fff] to-[#cf70ac]"
                >
                    <div className="w-full h-full rounded-[6px] overflow-hidden bg-gray-400">
                        <img src={img} alt="Improv" className="w-full h-full object-cover" />
                    </div>
                </div>

                <div
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    className="absolute inset-0 p-[2px] rounded-lg bg-gradient-to-r from-[#a97fff] to-[#cf70ac]"
                >
                    <div className="w-full h-full rounded-[6px] bg-blue-950 flex items-center justify-center">
                        <p className="text-white text-2xl">?</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImprovCard;