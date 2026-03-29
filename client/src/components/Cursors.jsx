import React from 'react';
import {observer} from "mobx-react-lite";
import gameState from "../store/GameState.js";

const Cursors = observer(() => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Object.entries(gameState.cursors).map(([username, pos]) => (
                <div
                    key={username}
                    className="absolute flex flex-col items-start"
                    style={{
                        left: pos.x * window.innerWidth,
                        top: pos.y * window.innerHeight,
                        transform: "translate(0, 0)",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M0 0L0 12L3.5 8.5L6 14L8 13L5.5 7.5L10 7.5L0 0Z" fill="#a97fff"/>
                    </svg>
                    <span className="bg-gradient-to-r from-[#a97fff] to-[#cf70ac] text-white text-xs px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
                        {username}
                    </span>
                </div>
            ))}
        </div>
    );
});

export default Cursors;