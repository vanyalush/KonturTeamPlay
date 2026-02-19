//MOVING MOTIVATORS


import React, {useEffect, useState} from 'react';

import NavBar from "../../components/NavBar.jsx";
import gameState from "../../store/GameState.js";
import {useParams} from "react-router-dom";
import UsernameModal from "../../components/UsernameModal.jsx";
import Motivators from "./Motivators.jsx";
import {observer} from "mobx-react-lite";
import {motivators_data} from "./data/MotivatorsData.jsx";
import {useReveal} from "./hooks/useReveal.js";


const GameOne = observer(() => {
    const [modal, setModal] = useState(true)
    const params = useParams();
    const {revealHandler, revealAllHandler} = useReveal(motivators_data, params.id);


    const connectHandler = (username) => {
        gameState.setUsername(username);
        gameState.setSessionId(params.id);
        gameState.resetReveal()

        setModal(false);
    }

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
                    case "syncRevealed":
                        console.log(`Синхронизация: открыто карт - ${msg.revealedCount}`);
                        gameState.setRevealed(msg.revealedCount);
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
                    <button onClick={revealHandler} onDoubleClick={revealAllHandler} className="flex items-center justify-center btn my-2 label mt-6">
                        Открыть
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