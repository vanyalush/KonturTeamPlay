import React from 'react';
import Card from "../components/Card.jsx";
import game1 from '../components/assets/game1.png';
import game2 from '../components/assets/game2.png';
import game3 from '../components/assets/game3.png';
import game4 from '../components/assets/game4.png';
import {GAMEFOUR_ROUTE, GAMEONE_ROUTE, GAMETHREE_ROUTE, GAMETWO_ROUTE} from "../utils/consts.js";


const Hero = () => {

    return (
        <div className="flex items-center justify-center">
            <div className="w-9/12 flex flex-col justify-center items-center">
                <p className="headline3 mt-5">
                    Игры, которые объединяют команды
                </p>
                <p className="headline5 mt-5">
                    Нажимай на карточки, выбери игру, нажми «Играть», отправь ссылку<br/>
                    участникам — и начинайте играть вместе в считанные секунды.
                </p>
                <div className="flex flex-row items-center gap-4 mt-5">
                    <Card
                        title="Moving Motivators"
                        description="Разложите мотиваторы по важности,
                                     обсудите выбор
                                     и изменение приоритетов."
                        image={game1}
                        link={GAMEONE_ROUTE}
                    />
                    <Card
                        title="Improv Cards"
                        description="Тяните карту с заданием
                                     и выполняйте его спонтанно
                                     для развития креативности."
                        image={game2}
                        link={GAMETWO_ROUTE}
                    />
                    <Card
                        title="Delegation Poker"
                        description="Найдите баланс управления:
                                     держать под контролем
                                     или отпустить в автономию."
                        image={game3}
                        link={GAMETHREE_ROUTE}
                    />
                    <Card
                        title="Two Truths and a Lie"
                        description="Назовите три факта о себе:
                                     два — правда, один — ложь.
                                     Пусть другие угадают."
                        image={game4}
                        link={GAMEFOUR_ROUTE}
                    />
                </div>
            </div>
        </div>

    );
};

export default Hero;