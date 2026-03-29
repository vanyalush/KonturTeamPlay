//TWO TRUTHS AND A LIE


import React, {useEffect, useState} from 'react';
import UsernameModal from "../../components/UsernameModal.jsx";
import NavBar from "../../components/NavBar.jsx";
import gameState from "../../store/GameState.js";
import {Link, useNavigate, useParams} from "react-router-dom";
import PlayerBarFour from "./PlayerBarFour.jsx";
import {observer} from "mobx-react-lite";

const GameFour = observer(() => {
    const [isReady, setIsReady] = useState(false);
    const [readyCount, setReadyCount] = useState(0);
    const [countDown, setCountDown] = useState(null);
    const navigate = useNavigate();
    const {id} = useParams();

    const [modal, setModal] = useState(true);
    const params = useParams();
    const getGameRoute = () => {
        if(location.pathname.includes('truths_lie')) return `/truths_lie/${id}/game`
    }


    const handleReady = () => {
        if (isReady) {
            setIsReady(false);
            gameState.removeReadyPlayer(gameState.username);
            gameState.socket?.send(JSON.stringify({
                method: "playerUnready",
                sessionId: gameState.sessionId,
                username: gameState.username
            }));
        } else {
            setIsReady(true);
            gameState.socket?.send(JSON.stringify({
                method: "playerReady",
                sessionId: gameState.sessionId,
                username: gameState.username
            }));
        }
    }

    const connectHandler = (username) => {
        gameState.setUsername(username);
        gameState.setSessionId(params.id)
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
                    case "syncReady":
                        setReadyCount(msg.readyCount);
                        if (msg.isReady === false) {
                            gameState.removeReadyPlayer(msg.username);
                        } else {
                            gameState.addReadyPlayer(msg.username);
                        }
                        break;
                    case "startCountdown":
                        setCountDown(msg.count);
                        break;
                    case "navigateToGame":
                        navigate(getGameRoute());
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

    useEffect(() => {
        if(gameState.players.length > 0 && readyCount === gameState.players.length){
            setCountDown(5)
        }else{
            setCountDown(null)
        }
    }, [readyCount, gameState.players.length]);

    useEffect(() => {
        if(countDown === null)return;
        if(countDown === 0){
            navigate(getGameRoute());
            return;
        }
        const timer = setTimeout(() => setCountDown(prev => prev-1), 1000);
        return () => clearTimeout(timer);
    }, [countDown])

    return (
        <div className="flex flex-col items-center">
            {modal && (<UsernameModal onConnect={connectHandler} name={"Two Truths and a Lie"}/>)}
            <NavBar/>
            {!modal && (
                <div className="w-9/12 flex flex-col mt-5">
                    <p className="headline2 mr-auto">
                        Two Truths And a Lie
                    </p>
                    <div className="flex justify-between items-center ">
                        <p className="headline5 mt-5 mr-auto text-left">
                            Каждый участник рассказывает три факта о себе — два правдивых и одну ложь. Остальным нужно угадать обманку, раскрывая неожиданные стороны друг друга через игру и интуицию.
                        </p>
                    </div>
                    <PlayerBarFour/>
                    <div className="w-full flex flex-row items-center justify-between mt-16">
                        <button
                            className="btn w-2/12 bg-gradient-to-r from-[#a97fff] to-[#cf70ac] text-white px-6 "
                        >
                            Готовы {readyCount}/{gameState.players.length}
                        </button>
                        {countDown !== null ? (
                            <p key={countDown} style={{ animation: "blurIn 0.4s ease forwards" }}
                               className="w-3/12 text-center headline4">
                                Игра начнётся через: {countDown}
                            </p>
                        ) : (
                            <p className="w-3/12 text-center text-gray-400">Ждём игроков...</p>
                        )}
                        <button
                            onClick={handleReady}
                            className={`btn w-2/12  transition-all duration-300 ${
                                isReady ? "bg-blue-600 text-white" : ""
                            }`}
                            style={{
                                animation: isReady ? "glowPulse 1.5s ease-in-out infinite" : "none"
                            }}
                        >
                            {isReady ? "Отмена" : "Играть"}
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
});

export default GameFour;