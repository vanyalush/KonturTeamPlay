import React from 'react';
import gameState from "../../store/GameState.js";
import {observer} from "mobx-react-lite";

const PlayerBarFour = observer(() => {

    const MAX_PLAYERS = 8

    const shadow = { boxShadow: "0 4px 4px rgba(110, 110, 110, 0.25)" };

    const isPlayerReady = (player) => gameState.readyPlayers.includes(player);

    return (
        <div className="flex flex-row mx-auto gap-10 mt-24">
            {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
                const player = gameState.players[i];
                return player ? (
                    <div key={i} className=" flex flex-col items-center gap-2">
                        <div
                            className="w-23 h-23 rounded-full p-[2px] bg-gradient-to-r from-[#a97fff] to-[#cf70ac]"
                            style={shadow}
                        >
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <p className="headline3">{player.charAt(0)}</p>
                            </div>
                        </div>
                        <p className={`w-full h-8 body2 mt-2 text-sm flex justify-center items-center rounded-[15px] transition-colors duration-300 ${
                            isPlayerReady(player) ? "bg-green-300" : "bg-red-300"
                        }`}>
                            {player}
                        </p>
                    </div>
                ) : (
                    <div
                        key={i}
                        className="w-23 h-23 rounded-full bg-gray-200"
                        style={shadow}
                    />
                );
            })}
        </div>
    );
});

export default PlayerBarFour;