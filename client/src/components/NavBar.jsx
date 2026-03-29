import React, {useState} from 'react';
import copy from './assets/copy.png'
import save from './assets/save.png'
import PlayersBar from "./PlayersBar.jsx";
import gameState from "../store/GameState.js";
import {observer} from "mobx-react-lite";
import {Link, useLocation, useParams} from "react-router-dom";


const NavBar = observer(() => {
    const [showCopied, setShowCopied] = useState(false);
    const [timerValue, setTimerValue] = useState("01:30");

    const location = useLocation();
    const { id } = useParams();
    const gameOne = location.pathname.includes("moving");
    const gameTwo = location.pathname.includes("improv");
    const gameFour = location.pathname.includes("truths_lie");
    const showEditing = gameOne || gameTwo;
    const currentUrl = window.location.href.replace(/^https?:\/\//, '');


    const getSaveRoute = () => {
        if(location.pathname.includes('moving')) return `/moving/${id}/save`
        if(location.pathname.includes('improv')) return `/improv/${id}/save`
    }

    const handleToggleEdit = () => {
        gameState.toggleEditing()
    };

    const handleCopy = async () => {
        try {

            await navigator.clipboard.writeText(currentUrl);
            setShowCopied(true);

            setTimeout(() => {
                setShowCopied(false);
            }, 1000);
        } catch (err) {
            console.error('Ошибка копирования:', err);
        }
    };
    const handleTimerChange = (e) => {
        let val = e.target.value.replace(/[^0-9]/g, ''); // только цифры
        if (val.length > 4) val = val.slice(0, 4);

        // Форматируем как MM:SS
        if (val.length >= 3) {
            val = val.slice(0, 2) + ':' + val.slice(2);
        }

        setTimerValue(val);

        const parts = val.split(":");
        if (parts.length === 2 && val.length === 5) {
            const min = parseInt(parts[0]) || 0;
            const sec = parseInt(parts[1]) || 0;
            gameState.setTimerDuration(min * 60 + sec);
        }

    }
    return (
        <div className="w-9/12 flex flex-row  ">
            {showCopied && (
                <div className="absolute top-7 ml-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-400 text-white px-6 py-2 rounded-[10px] shadow-lg z-50 animate-fade-in-out">
                    Скопировано!
                </div>
            )}
            <div className="w-6/12 h-12 flex flex-row justify-between items-center bg-gray-300 mt-6 rounded-[10px]">
                <p className="headline5 pl-6">
                    ссылка для участников
                </p>
                <div className="w-6/12 h-7 bg-white flex items-center justify-between rounded-[5px] mr-3"
                     onClick={handleCopy}
                >
                    <p className="body2 pl-3">
                        {currentUrl}
                    </p>
                    <img src={copy} alt="copy" className="scale-120 mr-2"/>
                </div>
            </div>
            {showEditing && (
                <div className="w-3/12 h-12 flex flex-row justify-between items-center bg-gray-300 mt-6 rounded-[10px] ml-2">
                    <p className="body2 pl-8">
                        редактирование
                    </p>
                    <button
                        className={`bg-white w-[55px] h-8 mr-5 rounded-4xl flex items-center justify-between transition-all duration-1000 ${gameState.isEditing ? 'justify-end' : 'justify-start'}`}
                        onClick={handleToggleEdit}
                    >
                        <div className={`w-7/12 h-8 ${gameState.isEditing ? 'bg-blue-700' : 'bg-blue-950'} rounded-4xl transition-colors duration-200`}></div>
                    </button>
                </div>

            )}
            {showEditing && (
                <PlayersBar/>

            )}
            {gameOne && (
                <Link to={getSaveRoute()} className="w-14 h-12 flex items-center justify-center bg-gray-300 mt-6 rounded-[10px] ml-2">
                    <img src={save} alt="save"/>
                </Link>
            )}
            {gameFour && (
                <div className=" w-2/12 h-12 flex flex-row justify-between items-center bg-gray-300 mt-6 rounded-[10px] ml-2">
                    <p className="body2 pl-5">
                        Таймер на:
                    </p>
                    <input
                        type="text"
                        value={timerValue}
                        onChange={handleTimerChange}
                        maxLength={5}
                        placeholder="01:30"
                        className="bg-white w-[60px] h-8 mr-3 rounded-[8px] text-center body2 focus:outline-none"
                    />
                </div>
            )}
        </div>
    );
});

export default NavBar;