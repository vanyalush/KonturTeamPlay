
const express = require('express');
const WebSocket = require('ws');
const app = express();
const WsServer = require('express-ws')(app);
const aWss = WsServer.getWss();

const PORT = process.env.PORT || 5001;

const sessions = {};
const sessionState = {};

app.ws('/', (ws, req) => {
    ws.on('message', (msg) => {
        msg = JSON.parse(msg)
        switch (msg.method) {
            case "connection":
                connectionHandler(ws, msg)
                break
            case "updateOrder":
                updateOrderHandler(ws, msg)
                break
            case "revealedCard":
                revealCardHandler(ws, msg)
                break
            case "revealAllCard":
                revealAllCardHandler(ws, msg)
                break
        }
    })
    ws.on('close', () => {
        if (ws.sessionId && ws.username && sessions[ws.sessionId]) {
            sessions[ws.sessionId].delete(ws.username);
            broadcastPlayersUpdate(ws.sessionId);
        }
    })
})
app.listen(PORT, () => console.log(`server started on PORT ${PORT}`))

const connectionHandler = (ws, msg) => {
    const {id: sessionId, username} = msg;
    if (!sessions[sessionId]) {
        sessions[sessionId] = new Set();
        sessionState[sessionId] = { revealedCount: 0, order: null };
    }
    sessions[sessionId].add(username);
    ws.sessionId = sessionId;
    ws.username = username;

    console.log(`Игрок ${username} присоединился к сессии ${sessionId}`);
    console.log(`Текущие игроки:`, Array.from(sessions[sessionId]));

    broadcastPlayersUpdate(sessionId);

    ws.send(JSON.stringify({
        method: "connection",
        username: username
    }));

    const state = sessions[sessionId];
    if(state.revealedCount > 0){
        ws.send(JSON.stringify({
            method: "syncRevealed",
            revealedCount: state.revealedCount
        }))
    }
    if(state.order){
        ws.send(JSON.stringify({
            method: "syncOrder",
            order: state.order
        }))
    }
}

const revealCardHandler = (ws, msg) => {
    const {sessionId, revealedCount} = msg;
    if (sessionState[sessionId]) {
        sessionState[sessionId].revealedCount = revealedCount;
    }

    aWss.clients.forEach((client) => {
        if(
            client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId &&
            client !== ws
        ) {
            client.send(JSON.stringify({
                method: "syncRevealed",
                revealedCount: revealedCount
            }));
        }
    });
}

const revealAllCardHandler = (ws, msg) => {
    const {sessionId, totalCount} = msg;

    aWss.clients.forEach((client) => {
        if(
            client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId &&
            client !== ws
        ) {
            client.send(JSON.stringify({
                method: "syncRevealed",
                revealedCount: totalCount
            }));
        }
    });
}

const updateOrderHandler = (ws, msg) => {
    const {sessionId, order} = msg;
    if (sessionState[sessionId]) {
        sessionState[sessionId].order = order;
    }

    if(!sessions[sessionId]) {
        console.warn("Ссесия не найдена")
    }

    aWss.clients.forEach((client) => {
        if(
            client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId
        ) {
            client.send(JSON.stringify({
                method: "syncOrder",
                order: order,
                sender: ws.username,
            }));
        }
    })
}


const broadcastPlayersUpdate = (sessionId) => {
    if(!sessions[sessionId]) return;

    const players = Array.from(sessions[sessionId]);

    aWss.clients.forEach(client => {
        if (client.sessionId === sessionId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                method: "updatePlayers",
                players: players
            }));
        }
    });
}