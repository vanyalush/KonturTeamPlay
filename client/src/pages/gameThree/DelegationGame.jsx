import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import gameState from "../../store/GameState.js";
import { observer } from "mobx-react-lite";

const LEVELS = [
    { level: 1, title: "Сообщаю сам", description: "Я сам решаю и просто информирую команду." },
    { level: 2, title: "Объясняю решение", description: "Я решил, но хочу донести логику своего решения." },
    { level: 3, title: "Собираю мнение", description: "Я решу, но сначала выслушаю вас." },
    { level: 4, title: "Согласуем вместе", description: "Обсуждаем и ищем компромисс вместе." },
    { level: 5, title: "Доверяю после согласования", description: "Вы предлагаете решение, я утверждаю." },
    { level: 6, title: "Доверяю с информированием", description: "Вы решаете, но держите меня в курсе." },
    { level: 7, title: "Полное делегирование", description: "Решайте сами, даже не обязательно отчитываться." },
];

const SCENARIOS = [
    "Инженер выбирает библиотеку для нового сервиса. Опыта с этой задачей нет, но общий опыт есть.",
    "Дизайнер предлагает полностью переработать UI главной страницы продукта.",
    "Менеджер хочет нанять нового сотрудника в команду без согласования с тимлидом.",
    "Разработчик решает перенести дедлайн задачи на неделю из-за технических сложностей.",
    "Команда хочет перейти на новый стек технологий для следующего проекта.",
];

const DelegationGame = observer(() => {
    const { id } = useParams();
    const [phase, setPhase] = useState("scenario");
    const [currentScenario, setCurrentScenario] = useState(SCENARIOS[0]);
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [myVote, setMyVote] = useState(null);
    const [votes, setVotes] = useState({});
    const [votedCount, setVotedCount] = useState(0);
    const [agreedLevel, setAgreedLevel] = useState(null);
    const [results, setResults] = useState([]);

    const isModerator = gameState.players[0] === gameState.username;

    useEffect(() => {
        if (gameState.username) {
            const socket = new WebSocket(`ws://localhost:5001/`);
            gameState.setSocket(socket);

            socket.onopen = () => {
                socket.send(JSON.stringify({
                    id: id,
                    username: gameState.username,
                    method: "connection"
                }));
            };

            socket.onmessage = (e) => {
                const msg = JSON.parse(e.data);
                switch (msg.method) {
                    case "updatePlayers":
                        gameState.setPlayers(msg.players);
                        break;
                    case "startVoting":
                        setPhase("voting");
                        setCurrentScenario(msg.scenario);
                        setScenarioIndex(msg.scenarioIndex);
                        setMyVote(null);
                        setVotes({});
                        setVotedCount(0);
                        break;
                    case "syncDelegationVotes":
                        setVotedCount(msg.votedCount);
                        break;
                    case "startReveal":
                        setPhase("reveal");
                        setVotes(msg.votes);
                        break;
                    case "startNextScenario":
                        setResults(prev => [...prev, {
                            scenario: currentScenario,
                            votes: msg.prevVotes,
                            agreedLevel: msg.agreedLevel
                        }]);
                        setPhase("scenario");
                        setCurrentScenario(msg.scenario);
                        setScenarioIndex(msg.scenarioIndex);
                        setAgreedLevel(null);
                        setMyVote(null);
                        setVotes({});
                        break;
                    case "startResults":
                        setResults(msg.results);
                        setPhase("results");
                        break;
                }
            };

            socket.onclose = () => console.log("Соединение закрыто");
            return () => socket.close();
        }
    }, [gameState.username]);

    const handleStartVoting = () => {
        gameState.socket?.send(JSON.stringify({
            method: "delegationStartVoting",
            sessionId: id,
            scenario: currentScenario,
            scenarioIndex
        }));
    };

    const handleVote = (level) => {
        if (myVote !== null) return;
        setMyVote(level);
        gameState.socket?.send(JSON.stringify({
            method: "delegationVote",
            sessionId: id,
            username: gameState.username,
            level
        }));
    };

    const handleAgree = () => {
        if (agreedLevel === null) return;
        const isLast = scenarioIndex >= SCENARIOS.length - 1;
        gameState.socket?.send(JSON.stringify({
            method: "delegationAgree",
            sessionId: id,
            agreedLevel,
            scenarioIndex,
            isLast,
            results: [...results, { scenario: currentScenario, votes, agreedLevel }]
        }));
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-9/12 flex flex-col mt-5">

                {/* SCENARIO */}
                {phase === "scenario" && (
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                            <p className="headline2">Delegation Poker</p>
                            <p className="body2 text-gray-400">
                                Сценарий {scenarioIndex + 1}/{SCENARIOS.length}
                            </p>
                        </div>
                        <div
                            style={{ animation: "fadeIn 0.4s ease forwards" }}
                            className="mt-8 p-8 bg-white rounded-2xl border-2 border-gray-200"
                        >
                            <p className="headline5 text-left">{currentScenario}</p>
                        </div>
                        {isModerator ? (
                            <button
                                onClick={handleStartVoting}
                                className="btn mt-8 w-45 mx-auto"
                                style={{ animation: "glowPulse 1.5s ease-in-out infinite" }}
                            >
                                Начать голосование
                            </button>
                        ) : (
                            <p className="body2 text-gray-400 text-center mt-8 animate-pulse">
                                Ждём пока модератор начнёт голосование...
                            </p>
                        )}
                    </div>
                )}

                {/* VOTING */}
                {phase === "voting" && (
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                            <p className="headline2">Выберите уровень</p>
                            <p className="body2 text-gray-400">
                                Проголосовали {votedCount}/{gameState.players.length}
                            </p>
                        </div>
                        <div className="mt-4 p-6 bg-white rounded-2xl border-2 border-gray-200 mb-8">
                            <p className="headline5 text-left">{currentScenario}</p>
                        </div>
                        <div className="grid grid-cols-7 gap-3">
                            {LEVELS.map(({ level, title, description }) => (
                                <div
                                    key={level}
                                    onClick={() => handleVote(level)}
                                    style={{ animation: `fadeIn 0.3s ease forwards`, animationDelay: `${level * 0.05}s`, opacity: 0 }}
                                    className={`flex flex-col items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                        myVote === level
                                            ? "border-purple-500 bg-purple-50 scale-105"
                                            : myVote !== null
                                                ? "opacity-40 cursor-not-allowed border-gray-200 bg-white"
                                                : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#a97fff] to-[#cf70ac] flex items-center justify-center text-white font-bold text-xl mb-3">
                                        {level}
                                    </div>
                                    <p className="font-bold text-sm text-center mb-2">{title}</p>
                                    <p className="text-xs text-gray-500 text-center">{description}</p>
                                </div>
                            ))}
                        </div>
                        {myVote !== null && (
                            <p className="body2 text-gray-400 text-center mt-6 animate-pulse">
                                Вы выбрали уровень {myVote} — ждём остальных...
                            </p>
                        )}
                    </div>
                )}

                {/* REVEAL */}
                {phase === "reveal" && (
                    <div className="flex flex-col">
                        <p className="headline2 mb-8">Результаты голосования</p>
                        <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 mb-8">
                            <p className="headline5 text-left">{currentScenario}</p>
                        </div>

                        {/* Карточки с голосами */}
                        <div className="flex gap-4 flex-wrap mb-8">
                            {Object.entries(votes).map(([player, level], i) => (
                                <div
                                    key={player}
                                    style={{ animation: "fadeIn 0.4s ease forwards", animationDelay: `${i * 0.1}s`, opacity: 0 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-r from-[#a97fff] to-[#cf70ac]">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                            <p className="headline4">{player.charAt(0)}</p>
                                        </div>
                                    </div>
                                    <p className="body2">{player}</p>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#a97fff] to-[#cf70ac] flex items-center justify-center text-white font-bold">
                                        {level}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Разброс */}
                        {Object.values(votes).length > 0 && (
                            <div className="flex gap-4 mb-8">
                                <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-gray-500">Минимум</p>
                                    <p className="headline4 text-red-500">{Math.min(...Object.values(votes))}</p>
                                </div>
                                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                                    <p className="text-sm text-gray-500">Максимум</p>
                                    <p className="headline4 text-green-500">{Math.max(...Object.values(votes))}</p>
                                </div>
                                <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
                                    <p className="text-sm text-gray-500">Среднее</p>
                                    <p className="headline4 text-purple-500">
                                        {(Object.values(votes).reduce((a, b) => a + b, 0) / Object.values(votes).length).toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Модератор фиксирует итоговый уровень */}
                        {isModerator && (
                            <div className="flex flex-col gap-4">
                                <p className="headline5">Зафиксируйте итоговый уровень:</p>
                                <div className="flex gap-3">
                                    {LEVELS.map(({ level }) => (
                                        <button
                                            key={level}
                                            onClick={() => setAgreedLevel(level)}
                                            className={`w-12 h-12 rounded-full font-bold text-lg transition-all duration-200 ${
                                                agreedLevel === level
                                                    ? "bg-gradient-to-r from-[#a97fff] to-[#cf70ac] text-white scale-110"
                                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleAgree}
                                    disabled={agreedLevel === null}
                                    className={`btn w-2/12 mt-4 ${agreedLevel === null ? "opacity-50 cursor-not-allowed" : ""}`}
                                    style={{ animation: agreedLevel !== null ? "glowPulse 1.5s ease-in-out infinite" : "none" }}
                                >
                                    {scenarioIndex >= SCENARIOS.length - 1 ? "Завершить" : "Следующий"}
                                </button>
                            </div>
                        )}
                        {!isModerator && (
                            <p className="body2 text-gray-400 animate-pulse">
                                Ждём пока модератор зафиксирует уровень...
                            </p>
                        )}
                    </div>
                )}

                {/* RESULTS */}
                {phase === "results" && (
                    <div className="flex flex-col">
                        <p className="headline2 mb-8">Итоги сессии 🎉</p>
                        <div className="flex flex-col gap-6">
                            {results.map((result, i) => (
                                <div
                                    key={i}
                                    style={{ animation: "fadeIn 0.4s ease forwards", animationDelay: `${i * 0.15}s`, opacity: 0 }}
                                    className="bg-white p-6 rounded-2xl border-2 border-gray-200"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="headline5 text-left flex-1 mr-4">{result.scenario}</p>
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#a97fff] to-[#cf70ac] flex items-center justify-center text-white font-bold text-xl shrink-0">
                                            {result.agreedLevel}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-wrap">
                                        {Object.entries(result.votes).map(([player, level]) => (
                                            <div key={player} className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
                                                <span className="text-sm font-bold">{player}</span>
                                                <span className="text-sm text-purple-600">→ {level}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default DelegationGame;