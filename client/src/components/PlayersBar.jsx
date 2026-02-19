import React from 'react';
import {observer} from "mobx-react-lite";
import gameState from "../store/GameState.js";

const PlayersBar = observer(() => {
    return (
        <div className="w-3/12 h-12 bg-gray-300 mt-6 rounded-[10px] ml-2 flex items-center justify-between px-4 relative group">
            <div className="flex items-center">
                <div className="flex -space-x-2 mr-1">
                    {gameState.players.slice(0, 5).map((player, index) => (
                        <div
                            key={index}
                            className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                            title={player}
                        >
                            {player.charAt(0).toUpperCase()}
                        </div>
                    ))}
                    {gameState.players.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-white text-xs">
                            +{gameState.players.length - 5}
                        </div>
                    )}
                </div>
                <p className="body2 font-medium ml-2">
                    {gameState.players.length} участник(ов)
                </p>
            </div>

            <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200 p-3">
                <p className="body1 mb-2 text-gray-700">Участники в сессии:</p>
                <div className="max-h-48 overflow-y-auto">
                    {gameState.players.length > 0 ? (
                        gameState.players.map((player, index) => (
                            <div
                                key={index}
                                className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors"
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-sm font-medium text-gray-800">{player}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">Нет игроков</p>
                    )}
                </div>
            </div>
        </div>
    );
});

export default PlayersBar;