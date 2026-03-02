//IMPROV CARDS


import React, {useEffect, useState} from 'react';
import UsernameModal from "../../components/UsernameModal.jsx";
import NavBar from "../../components/NavBar.jsx";
import gameState from "../../store/GameState.js";
import {useParams} from "react-router-dom";
import ImprovsContainer from "./ImprovsContainer.jsx";

const GameTwo = () => {
    const [modal, setModal] = useState(true);
    const [mode, setMode] = useState("swap");
    const params = useParams();

    const connectHandler = (username) => {
        gameState.setUsername(username);
        gameState.setSessionId(params.id)
        setModal(false);
    }

    useEffect(() => {
        if(!gameState.socket) return;

        const handler = (e) => {
            const msg = JSON.parse(e.data);
            if(msg.method === "syncMode") {
                setMode(msg.mode);
            }
        }

        gameState.socket.addEventListener("message", handler);
        return () => {gameState.socket.removeEventListener("message", handler);}
    }, [gameState.socket]);

    useEffect(() => {
        if(gameState.username){
            const socket = new WebSocket(`ws://localhost:5001/`);
            gameState.setSocket(socket);

            gameState.clearPlayers();
            gameState.addPlayer(gameState.username);

            socket.onopen = () => {
                console.log('Подключение установлено');
                socket.send(JSON.stringify({
                    id: params.id,
                    username: gameState.username,
                    method: "connection"
                }))
            }
            socket.onmessage = (e) => {
                let msg = JSON.parse(e.data)
                switch (msg.method) {
                    case "connection":
                        console.log(`Пользователь ${msg.username} присоединился`);
                        break;
                    case "disconnection":
                        console.log(`Пользователь ${msg.username} отлючился`);
                        gameState.removePlayer(msg.username);
                        break;
                    case "updatePlayers":
                        console.log('Обновлён список игроков:', msg.players);
                        gameState.setPlayers(msg.players);
                        break;
                }
            }
            socket.onclose = () => {
                console.log('Соединение закрыто');
            }
            return () => {
                socket.close();
            };
        }

    }, [gameState.username])


    const handleModeChange = (newMode) => {
        setMode(newMode);
        gameState.socket?.send(JSON.stringify({
            method: "updateMode",
            sessionId: gameState.sessionId,
            mode: newMode
        }));
    };

    return (
        <div className="flex flex-col items-center">
            {modal && (<UsernameModal onConnect={connectHandler} name={"Improv Cards"}/>)}
            <NavBar/>
            {!modal && (
                <div className="w-9/12 flex flex-col mt-5">
                    <p className="headline2 mr-auto">
                        Improv Cards
                    </p>
                    <div className="flex justify-between items-center ">
                        <p className="headline5 text-left mt-5 mr-auto">
                            Один участник раскладывает карточки в любом порядке и импровизирует историю по ним. Каждый видит в изображениях своё — свобода интерпретации рождает уникальные истории.
                        </p>
                    </div>
                    <div className="w-3/12 flex flex-row justify-between items-center mx-auto bg-gray-300 rounded-[10px] mt-8">
                        <button
                            onClick={() => handleModeChange("swap")}
                            className={`w-6/12 h-[39px] flex items-center justify-center rounded-[10px] ${mode === "swap" ? "bg-blue-950 text-white" : ""}`}
                        >
                            <p className="body1 ">меняй местами</p>
                        </button>
                        <button
                            onClick={() => handleModeChange("blind")}
                            className={`w-6/12 h-[39px] rounded-[10px] ${mode === "blind" ? "bg-blue-950 text-white" : ""}`}
                        >
                            <p className="body1 ">вслепую</p>
                        </button>
                    </div>
                    <ImprovsContainer isSwap={mode === "swap"} isBlind={mode === "blind"}/>
                </div>
            )}
        </div>
    );
};

export default GameTwo;