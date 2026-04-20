//MOVING MOTIVATORS


import React, {useEffect, useState} from 'react';

import NavBar from "../../components/NavBar.jsx";
import gameState from "../../store/GameState.js";
import {Link, useParams} from "react-router-dom";
import UsernameModal from "../../components/UsernameModal.jsx";
import Motivators from "./Motivators.jsx";
import {observer} from "mobx-react-lite";
import {motivators_data} from "./data/MotivatorsData.jsx";
import {useReveal} from "./hooks/useReveal.js";
import Cursors from "../../components/Cursors.jsx";
import { throttle } from "lodash";


const GameOne = observer(() => {
    const [modal, setModal] = useState(true)
    const params = useParams();
    const isFinished = gameState.revealedCount >= motivators_data.length;

    const {handleClick, handleDoubleClick} = useReveal(motivators_data, params.id);

    const getSaveRoute = () => {
        if(location.pathname.includes('moving')) return `/moving/${params}/save`
    }


    const connectHandler = (username) => {
        gameState.setUsername(username);
        gameState.setSessionId(params.id);
        gameState.resetReveal()

        setModal(false);
    }
    useEffect(() => {
        if(!gameState.socket) return;

        const handleMouseMove = throttle((e) => {
            gameState.socket.send(JSON.stringify({
                method: "cursorMove",
                sessionId: gameState.sessionId,
                username: gameState.username,
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            }))
        }, 50)

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);

    }, [gameState.socket])

    useEffect(() => {
        if(gameState.username){
            const socket = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:5001/");
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
                        gameState.removeCursor(msg.username);
                        break;
                    case "updatePlayers":
                        console.log('Обновлён список игроков:', msg.players);
                        gameState.setPlayers(msg.players);
                        break;
                    case "syncRevealed":
                        console.log(`Синхронизация: открыто карт - ${msg.revealedCount}`);
                        gameState.setRevealed(msg.revealedCount);
                        break;
                    case "syncOrder":
                        console.log(`Синхронизация порядка:`, msg.order);
                        gameState.setSyncOrder(msg.order);
                        break;
                    case "syncCursor":
                        gameState.setCursor(msg.username, msg.x, msg.y);
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

    return (
        <div className="flex flex-col items-center ">
            <Cursors/>
            {modal && ( <UsernameModal onConnect={connectHandler} name={"Moving Motivators"}/>)}

            <NavBar/>

            {!modal && (
            <div className="w-9/12 flex flex-col mt-5">
                <p className="headline2 mr-auto">
                    Moving Motivators
                </p>
                <div className="flex justify-between items-center ">
                    <p className="headline5 mt-5 mr-auto">
                        Нажмите на кнопку справа, чтобы открыть карту. Двойной клик откроет все карты.
                    </p>
                    <button
                        onClick={handleClick}
                        onDoubleClick={handleDoubleClick}
                        style={{animation: !isFinished ? "glowPulse 1.5s ease-in-out infinite" : "none"}}
                        className="flex items-center justify-center btn my-2 label mt-6"
                    >
                        <span
                            key={isFinished ? "finish" : "open"}
                            style={{ animation: "glowPulse 0.4s ease forwards" }}
                        >
                            {isFinished ? (
                                <Link to={getSaveRoute()}>
                                    Завершить
                                </Link>
                                ) : "Открыть"}
                        </span>
                    </button>
                </div>

                <Motivators
                    data={motivators_data}
                    revealedCount={gameState.revealedCount}/>
            </div>
                )}
        </div>
    );
});
export default GameOne;