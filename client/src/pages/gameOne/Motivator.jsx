import React from 'react';

const Motivator = ({title, description, img}) => {

    return (
        <div className="w-68 h-[510px] bg-[#1A0C41] flex flex-col  rounded-[10px] transition-all duration-150 hover:scale-103">
            <img src={img} alt="motivImg" className="w-[200px] h-[150px] mx-auto mt-6"/>
            <p className="headline3 text-[24px] leading-8 bg-gradient-to-r from-[#a97fff] to-[#cf70ac] bg-clip-text text-transparent text-left ml-3 mt-9">
                {title}
            </p>
            <p className="body2 text-[17px] text-white ml-3 mt-6 text-left">
                {description}
            </p>
        </div>
    );
};

export default Motivator;