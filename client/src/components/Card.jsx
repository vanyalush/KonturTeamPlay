import React from 'react';
import { useState } from 'react';
import {Link, useNavigate} from "react-router-dom";
import {generateGameId} from "../utils/genarateId.js";

const Card = ({ title, description, image, link }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (baseRoute) => {
        const newId = generateGameId();
        const actualRoute = baseRoute.replace('/:id', '');
        navigate(`${actualRoute}/${newId}`);
    };

    return (
        <div className="relative" >
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative w-[260px] h-[363px] rounded-4xl bg-red-300 bg-cover bg-center bg-no-repeat shadow-3xl shadow-lg"
                style={{ backgroundImage: `url(${image})`, zIndex: 2}}
            >
            </div>
            <div className={`
                absolute left-1/2 -translate-x-1/2 top-[300px]
                w-[260px] h-[270px]
                transition-all duration-[1000ms]
                ease-[cubic-bezier(0.22,1,0.36,1)]
                ${isExpanded
                    ? "translate-y-0 opacity-100 scale-100"
                    : "-translate-y-24 opacity-0 scale-100 pointer-events-none"}
               `}
                 style={{ zIndex: 0 }}
            >
                <div className="flex flex-col justify-center items-center bg-gray-300 rounded-4xl">
                    <h3 className="headline4 mt-[68px]">{title}</h3>
                    <p className="body1 text-center w-[235px] mt-1">
                        {description}
                    </p>
                    <button
                        className="flex items-center justify-center btn my-2  label"
                        onClick={() => handleCardClick(link)}
                    >
                        Играть
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Card;