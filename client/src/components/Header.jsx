import React from 'react';
import {Link} from "react-router-dom";
import {MAIN_ROUTE} from "../utils/consts.js";

const Header = () => {
    return (
        <div className="w-full h-15 bg-white flex items-center justify-center">
            <div className="w-9/12">
                <Link class="headline4" to={MAIN_ROUTE}>
                    Академ<span className="bg-gradient-to-r from-[#a97fff] to-[#cf70ac] bg-clip-text text-transparent">ТимПлей</span>
                </Link>
            </div>
        </div>
    );
};

export default Header;
