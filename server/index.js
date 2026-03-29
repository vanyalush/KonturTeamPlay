const express = require('express');
const WebSocket = require('ws');
const app = express();
const WsServer = require('express-ws')(app);
const aWss = WsServer.getWss();

const PORT = process.env.PORT || 5001;

const sessions = {};
const sessionState = {};

const broadcastToSession = (sessionId, data) => {
    aWss.clients.forEach(client => {
        if (client.sessionId === sessionId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

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
            case "updateMode":
                updateModeHandler(ws, msg)
                break
            case "cursorMove":
                cursorMoveHandler(ws, msg)
                break
            case "playerReady":
                playerReadyHandler(ws, msg)
                break
            case "playerUnready":
                playerUnreadyHandler(ws, msg)
                break
            case "submitStatements":
                submitStatementsHandler(ws, msg)
                break
            case "startTimer":
                startTimerHandler(ws, msg)
                break
            case "submitVote":
                submitVoteHandler(ws, msg);
                break;
        }
    })
    ws.on('close', () => {
        if (ws.sessionId && ws.username && sessions[ws.sessionId]) {
            sessions[ws.sessionId].delete(ws.username);
            broadcastPlayersUpdate(ws.sessionId);
            broadcastToSession(ws.sessionId, {
                method: "disconnection",
                username: ws.username
            });
        }
    })
})
app.listen(PORT, () => console.log(`server started on PORT ${PORT}`))

const connectionHandler = (ws, msg) => {
    const {id: sessionId, username} = msg;
    if (!sessions[sessionId]) {
        sessions[sessionId] = new Set();
        sessionState[sessionId] = {
            revealedCount: 0,
            order: null,
            readyCount: 0,
            gameStarted: false,
            timeLeft: 0
        };
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

    const state = sessionState[sessionId];
    if (state.revealedCount > 0) {
        ws.send(JSON.stringify({
            method: "syncRevealed",
            revealedCount: state.revealedCount
        }))
    }
    if (state.mode) {
        ws.send(JSON.stringify({
            method: "syncMode",
            mode: state.mode
        }))
    }
    if (state.order) {
        ws.send(JSON.stringify({
            method: "syncOrder",
            order: state.order
        }))
    }
    if (sessionState[sessionId].gameStarted && sessionState[sessionId].timeLeft > 0) {
        ws.send(JSON.stringify({
            method: "syncTimer",
            timeLeft: sessionState[sessionId].timeLeft
        }));
    }
}

const revealCardHandler = (ws, msg) => {
    const {sessionId, revealedCount, cardId} = msg;
    if (sessionState[sessionId]) {
        sessionState[sessionId].revealedCount = revealedCount;
    }
    aWss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId &&
            client !== ws) {
            client.send(JSON.stringify({
                method: "syncRevealed",
                cardId: cardId,
                revealedCount: revealedCount
            }));
        }
    });
}

const revealAllCardHandler = (ws, msg) => {
    const {sessionId, totalCount} = msg;
    aWss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId &&
            client !== ws) {
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
    aWss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId) {
            client.send(JSON.stringify({
                method: "syncOrder",
                order: order,
                sender: ws.username,
            }));
        }
    })
}

const updateModeHandler = (ws, msg) => {
    const {sessionId, mode} = msg;
    if (sessionState[sessionId]) {
        sessionState[sessionId].mode = mode;
    }
    aWss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId &&
            client !== ws) {
            client.send(JSON.stringify({
                method: "syncMode",
                mode: mode,
            }));
        }
    });
}

const broadcastPlayersUpdate = (sessionId) => {
    if (!sessions[sessionId]) return;
    const players = Array.from(sessions[sessionId]);
    broadcastToSession(sessionId, {
        method: "updatePlayers",
        players: players
    });
}

const cursorMoveHandler = (ws, msg) => {
    const {sessionId, username, x, y} = msg;
    aWss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN &&
            client.sessionId === sessionId &&
            client !== ws) {
            client.send(JSON.stringify({ method: "syncCursor", username, x, y }));
        }
    })
}

const playerReadyHandler = (ws, msg) => {
    const {sessionId, username} = msg;
    if (!sessionState[sessionId].readyCount) {
        sessionState[sessionId].readyCount = 0;
    }
    sessionState[sessionId].readyCount++;

    broadcastToSession(sessionId, {
        method: "syncReady",
        readyCount: sessionState[sessionId].readyCount,
        username: username
    });

    if (sessionState[sessionId].readyCount === sessions[sessionId].size) {
        let count = 5;
        const interval = setInterval(() => {
            broadcastToSession(sessionId, { method: "startCountdown", count });
            count--;
            if (count < 0) {
                clearInterval(interval);
                broadcastToSession(sessionId, { method: "navigateToGame" });
            }
        }, 1000);
    }
}

const playerUnreadyHandler = (ws, msg) => {
    const {sessionId, username} = msg;
    if (sessionState[sessionId].readyCount > 0) {
        sessionState[sessionId].readyCount--;
    }
    broadcastToSession(sessionId, {
        method: "syncReady",
        readyCount: sessionState[sessionId].readyCount,
        username: username,
        isReady: false
    });
}

const submitStatementsHandler = (ws, msg) => {
    const {sessionId, username, statements, lieIndex} = msg;
    if (!sessionState[sessionId].submissions) {
        sessionState[sessionId].submissions = {};
    }
    sessionState[sessionId].submissions[username] = { statements, lieIndex };

    const submittedCount = Object.keys(sessionState[sessionId].submissions).length;
    const totalPlayers = sessions[sessionId].size;

    broadcastToSession(sessionId, {
        method: "syncSubmitted",
        submittedCount
    });

    if (submittedCount === totalPlayers) {
        const players = Array.from(sessions[sessionId]);
        const firstPlayer = players[0];
        sessionState[sessionId].currentPlayer = firstPlayer;
        sessionState[sessionId].votes = {};

        const firstSubmission = sessionState[sessionId].submissions[firstPlayer];

        broadcastToSession(sessionId, {
            method: "startVoting",
            currentPlayer: firstPlayer,
            statements: firstSubmission.statements
        });
    }
}

const startTimerHandler = (ws, msg) => {
    const {sessionId, duration} = msg;

    if (sessionState[sessionId].gameStarted) return;

    sessionState[sessionId].gameStarted = true;
    sessionState[sessionId].timeLeft = duration;

    let timeLeft = duration;

    sessionState[sessionId].timerInterval = setInterval(() => {
        timeLeft--;
        sessionState[sessionId].timeLeft = timeLeft;
        broadcastToSession(sessionId, { method: "syncTimer", timeLeft });

        if (timeLeft <= 0) {
            clearInterval(sessionState[sessionId].timerInterval);
            sessionState[sessionId].gameStarted = false;
            broadcastToSession(sessionId, { method: "timerEnd" });
        }
    }, 1000);
}

const submitVoteHandler = (ws, msg) => {
    const { sessionId, username, voteIndex } = msg;

    if (!sessionState[sessionId].votes) {
        sessionState[sessionId].votes = {};
    }

    sessionState[sessionId].votes[username] = voteIndex;

    const totalVoters = sessions[sessionId].size - 1;
    const votedCount = Object.keys(sessionState[sessionId].votes).length;

    broadcastToSession(sessionId, {
        method: "syncVotes",
        votedCount,
        totalVoters
    });

    if (votedCount >= totalVoters) {
        const currentPlayer = sessionState[sessionId].currentPlayer;
        const submission = sessionState[sessionId].submissions[currentPlayer];

        if (!sessionState[sessionId].scores) {
            sessionState[sessionId].scores = {};
            Object.keys(sessionState[sessionId].submissions).forEach(p => {
                sessionState[sessionId].scores[p] = 0;
            });
        }

        Object.entries(sessionState[sessionId].votes).forEach(([player, vote]) => {
            if (vote === submission.lieIndex) {
                sessionState[sessionId].scores[player] += 1;
            }
        });

        broadcastToSession(sessionId, {
            method: "startReveal",
            lieIndex: submission.lieIndex,
            votes: sessionState[sessionId].votes,
            scores: sessionState[sessionId].scores
        });

        setTimeout(() => {
            const players = Array.from(sessions[sessionId]);
            const currentIndex = players.indexOf(currentPlayer);
            const nextIndex = currentIndex + 1;

            if (nextIndex >= players.length) {
                broadcastToSession(sessionId, {
                    method: "startResults",
                    scores: sessionState[sessionId].scores
                });
            } else {
                const nextPlayer = players[nextIndex];
                sessionState[sessionId].currentPlayer = nextPlayer;
                sessionState[sessionId].votes = {};

                const nextSubmission = sessionState[sessionId].submissions[nextPlayer];

                broadcastToSession(sessionId, {
                    method: "startVoting",
                    currentPlayer: nextPlayer,
                    statements: nextSubmission.statements
                });
            }
        }, 5000);
    }
};