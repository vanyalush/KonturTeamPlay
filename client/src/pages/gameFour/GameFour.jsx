//TWO TRUTHS AND A LIE


import React, {useEffect, useState} from 'react';
import UsernameModal from "../../components/UsernameModal.jsx";
import NavBar from "../../components/NavBar.jsx";
import Card from "../../components/Card.jsx";
import gameState from "../../store/GameState.js";
import {useParams} from "react-router-dom";

const GameFour = () => {
    const [modal, setModal] = useState(true);
    const params = useParams();

    const connectHandler = (username) => {
        gameState.setUsername(username);
        gameState.setSessionId(params.id)
        setModal(false);
    }

    useEffect(() => {
        if(gameState.username){
            const socket = new WebSocket(`ws://localhost:5001/`);
            gameState.setSocket(socket);
            socket.onopen = () => {
                console.log('Подключение установлено');
                socket.send(JSON.stringify({
                    id: params.id,
                    username: gameState.username,
                    method: "connection"
                }));
            }
            socket.onmessage = (e) => {
                let msg = JSON.parse(e.data)
                switch (msg.method) {
                    case "connection":
                        console.log(`пользователь ${msg.username} присоединился`)
                        break;
                }
            }
        }
    }, [gameState.username])

    return (
        <div className="flex flex-col items-center">
            {modal && (<UsernameModal onConnect={connectHandler} name={"Two Truths and a Lie"}/>)}
            <NavBar/>
            {modal && (
                <Card/>
            )}
        </div>
    );
};

export default GameFour;