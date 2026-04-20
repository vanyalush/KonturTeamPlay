import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import gameState from "../../store/GameState.js";
import {reaction} from "mobx";

const Game = () => {
    const { id } = useParams();
    const [statements, setStatements] = useState(["", "", ""]);
    const [lieIndex, setLieIndex] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [submittedCount, setSubmittedCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(gameState.timerDuration);

    const [phase, setPhase] = useState("writing");
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentStatements, setCurrentStatements] = useState([]);
    const [myVote, setMyVote] = useState(null);
    const [scores, setScores] = useState({});
    const [revealIndex, setRevealIndex] = useState(null);
    const [votes, setVotes] = useState({});
    const [votedCount, setVotedCount] = useState(0);
    const [totalVoters, setTotalVoters] = useState(0);


    useEffect(() => {
        if (gameState.username) {
            const socket = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:5001/");
            gameState.setSocket(socket);

            socket.onopen = () => {
                socket.send(JSON.stringify({
                    id: id,
                    username: gameState.username,
                    method: "connection"
                }));
                if (gameState.players[0] === gameState.username) {
                    socket.send(JSON.stringify({
                        method: "startTimer",
                        sessionId: id,
                        duration: gameState.timerDuration
                    }));
                }
            };

            socket.onmessage = (e) => {
                const msg = JSON.parse(e.data);
                switch (msg.method) {
                    case "updatePlayers":
                        gameState.setPlayers(msg.players);
                        break;
                    case "syncSubmitted":
                        setSubmittedCount(msg.submittedCount);
                        break;
                    case "syncTimer":
                        setTimeLeft(msg.timeLeft);
                        break;
                    case "startVoting":
                        setPhase("voting");
                        setCurrentPlayer(msg.currentPlayer);
                        setCurrentStatements(msg.statements);
                        setMyVote(null);
                        break;
                    case "startReveal":
                        setPhase("reveal");
                        setRevealIndex(msg.lieIndex);
                        setVotes(msg.votes);
                        setScores(msg.scores);
                        break;
                    case "startResults":
                        setPhase("results");
                        setScores(msg.scores);
                        break;
                    case "syncVotes":
                        setVotes(prev => ({ ...prev, [msg.votedCount]: msg.votedCount }));
                        setVotedCount(msg.votedCount);
                        setTotalVoters(msg.totalVoters);
                        break;
                }
            };

            socket.onclose = () => console.log("Соединение закрыто");

            return () => socket.close();
        }
    }, [gameState.username]);

    const formatTime = (t) => {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const handleSubmit = () => {
        if (statements.some(s => !s.trim()) || lieIndex === null) return;
        setSubmitted(true);
        gameState.socket?.send(JSON.stringify({
            method: "submitStatements",
            sessionId: id,
            username: gameState.username,
            statements,
            lieIndex
        }));
    };
    const handleVote = (index) => {
        if (myVote !== null || currentPlayer === gameState.username) return;
        setMyVote(index);
        gameState.socket?.send(JSON.stringify({
            method: "submitVote",
            sessionId: id,
            username: gameState.username,
            voteIndex: index
        }));
    };

    useEffect(() => {
        const dispose = reaction(
            () => gameState.socket,
            (socket) => {
                if (!socket) return;

                const handler = (e) => {
                    const msg = JSON.parse(e.data);
                    if (msg.method === "syncSubmitted") {
                        setSubmittedCount(msg.submittedCount);
                    }
                };
                socket.addEventListener("message", handler);
            },
            { fireImmediately: true }
        );
        return () => dispose();
    }, []);

    return (
        <div className="flex">
            {/* WRITING */}
            {phase === "writing" && !submitted && (
                <div className="flex flex-col w-9/12 mx-auto">
                    <div className="flex flex-row mt-5">
                        <p className="headline3 mr-auto">Two Truths And a Lie</p>
                        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                            <span className="text-2xl">⏱</span>
                            <span className="headline5">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                    <p className="headline5 mr-auto mt-5">
                        Напишите две <span className="text-green-500">Правды</span> и одну <span className="text-red-500">Ложь</span>
                    </p>
                    {statements.map((s, i) => (
                        <div
                            key={i}
                            onClick={() => setLieIndex(lieIndex === i ? null : i)}
                            className={`flex items-center w-full mx-auto mt-5 h-14 px-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                lieIndex === i ? "border-red-400 bg-red-50" : "border-green-300 bg-green-50"
                            }`}
                        >
                            <input
                                value={s}
                                onChange={(e) => {
                                    const updated = [...statements];
                                    updated[i] = e.target.value;
                                    setStatements(updated);
                                }}
                                placeholder={lieIndex === i ? "Напишите Ложь" : "Напишите Правду"}
                                className="flex-1 bg-transparent outline-none"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span className={`text-sm ${lieIndex === i ? "text-red-500" : "text-green-400"}`}>
                            {lieIndex === i ? "Ложь" : "Правда"}
                        </span>
                        </div>
                    ))}
                    <button
                        onClick={handleSubmit}
                        disabled={statements.some(s => !s.trim()) || lieIndex === null}
                        className={`btn w-2/12 mt-10 ${statements.some(s => !s.trim()) || lieIndex === null ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ animation: statements.some(s => !s.trim()) || lieIndex === null ? "none" : "glowPulse 1s ease-in-out infinite" }}
                    >
                        Завершить
                    </button>
                </div>
            )}

            {/* WAITING */}
            {phase === "writing" && submitted && (
                <div className="flex w-9/12 justify-center mx-auto mt-25">
                    <div className="flex flex-col items-center justify-center mt-24 gap-4">
                        <p className="headline4 text-gray-400 animate-pulse">Ждём остальных участников...</p>
                        <p className="body2 text-gray-400">Заполнили {submittedCount}/{gameState.players.length}</p>
                        <div className="flex gap-6 mt-40">
                            {gameState.players.map((player, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-r from-[#a97fff] to-[#cf70ac]">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                            <p className="headline4">{player.charAt(0)}</p>
                                        </div>
                                    </div>
                                    <p className="body2">{player}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* VOTING */}
            {phase === "voting" && (
                <div className="flex flex-col w-9/12 mx-auto mt-5">
                    <div className="flex flex-row justify-between items-center">
                        <p className="headline3">Угадайте ложь</p>
                        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                            <span className="text-2xl">⏱</span>
                            <span className="headline5">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                    <p className="headline5 mt-3 text-gray-500">
                        Утверждения игрока: <span className="font-bold text-black">{currentPlayer}</span>
                    </p>

                    {currentPlayer === gameState.username ? (
                        <div className="flex flex-col items-center mt-20 gap-4">
                            <p className="headline4 text-gray-400 animate-pulse">Игроки голосуют...</p>
                            <p className="body2 text-gray-400">
                                Проголосовали {votedCount}/{totalVoters}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 mt-8">
                            {currentStatements.map((s, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleVote(i)}
                                    className={`flex items-center h-14 px-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                        myVote === i
                                            ? "border-red-400 bg-red-50 scale-[1.02]"
                                            : myVote !== null
                                                ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                                                : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
                                    }`}
                                >
                                <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a97fff] to-[#cf70ac] text-white flex items-center justify-center text-sm mr-4 shrink-0">
                                    {i + 1}
                                </span>
                                    <p className="body1 text-left">{s}</p>
                                    {myVote === i && <span className="ml-auto text-red-500 text-sm">Мой выбор</span>}
                                </div>
                            ))}
                            {myVote !== null && (
                                <p className="body2 text-gray-400 text-center mt-4 animate-pulse">
                                    Ждём остальных...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* REVEAL */}
            {phase === "reveal" && (
                <div className="flex flex-col w-9/12 mx-auto mt-5">
                    <p className="headline3 mb-8">Результат раунда</p>
                    <p className="headline5 text-gray-500 mb-6">
                        Утверждения игрока: <span className="font-bold text-black">{currentPlayer}</span>
                    </p>
                    <div className="flex flex-col gap-4">
                        {currentStatements.map((s, i) => (
                            <div
                                key={i}
                                style={{ animation: `fadeIn 0.4s ease forwards`, animationDelay: `${i * 0.15}s`, opacity: 0 }}
                                className={`flex items-center h-14 px-6 rounded-2xl border-2 ${
                                    i === revealIndex
                                        ? "border-red-400 bg-red-50"
                                        : "border-green-300 bg-green-50"
                                }`}
                            >
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm mr-4 shrink-0 bg-gradient-to-r from-[#a97fff] to-[#cf70ac]">
                                {i + 1}
                            </span>
                                <p className="body1 text-left flex-1">{s}</p>
                                <span className={`text-sm font-bold ${i === revealIndex ? "text-red-500" : "text-green-500"}`}>
                                {i === revealIndex ? "ЛОЖЬ ❌" : "ПРАВДА ✓"}
                            </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <p className="headline5 mb-4">Результаты голосования:</p>
                        <div className="flex gap-4 flex-wrap">
                            {Object.entries(votes).map(([player, voteIdx]) => (
                                <div
                                    key={player}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                                        voteIdx === revealIndex ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    <span className="font-bold">{player}</span>
                                    <span>{voteIdx === revealIndex ? "✓ угадал" : "✗ не угадал"}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="headline5 mb-4">Очки:</p>
                        <div className="flex gap-4 flex-wrap">
                            {Object.entries(scores).map(([player, score]) => (
                                <div key={player} className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100">
                                    <span className="font-bold">{player}</span>
                                    <span className="text-purple-700">{score} очков</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* RESULTS */}
            {phase === "results" && (
                <div className="flex flex-col w-9/12 mx-auto mt-10 items-center">
                    <p className="headline2 mb-10">Итоги игры</p>
                    <div className="flex flex-col gap-4 w-full">
                        {Object.entries(scores)
                            .sort((a, b) => b[1] - a[1])
                            .map(([player, score], i) => (
                                <div
                                    key={player}
                                    style={{ animation: "fadeIn 0.4s ease forwards", animationDelay: `${i * 0.1}s`, opacity: 0 }}
                                    className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border-2 border-gray-200"
                                >
                                    <span className="text-2xl font-bold text-gray-400 w-8">{i + 1}</span>
                                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-r from-[#a97fff] to-[#cf70ac]">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                            <p className="headline4">{player.charAt(0)}</p>
                                        </div>
                                    </div>
                                    <p className="headline5 flex-1 text-left">{player}</p>
                                    <p className="headline4 text-purple-600">{score} очков</p>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;