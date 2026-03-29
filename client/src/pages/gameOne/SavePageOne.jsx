import React, {useRef} from 'react';
import {observer} from "mobx-react-lite";
import gameState from "../../store/GameState.js";
import {Link, useParams} from "react-router-dom";
import back from "../../pages/gameOne/assets/bxs-share.svg.png";
import jsPDF from "jspdf";


const SavePageOne = observer(() => {
    const { id } = useParams();
    const contentRef = useRef(null);

    const savePdf = async() => {
        try {
            const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

            pdf.addFont("https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf", "Roboto", "normal");
            pdf.setFont("Roboto");

            const pageWidth = pdf.internal.pageSize.getWidth();
            let y = 40;

            pdf.setFontSize(18);
            pdf.text("Результаты", 40, y);
            y += 40;

            gameState.savedMotivators.forEach((motivator, i) => {
                if (y > 780) { // новая страница
                    pdf.addPage();
                    y = 40;
                }

                pdf.setFillColor(169, 127, 255);
                pdf.circle(55, y + 8, 12, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(12);
                const titleLines = pdf.splitTextToSize(motivator.title || "", pageWidth - 100);
                pdf.text(String(i + 1), 51, y + 12);

                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(14);
                pdf.text(motivator.title || "", 80, y + 8);

                pdf.setTextColor(100, 100, 100);
                pdf.setFontSize(11);
                const lines = pdf.splitTextToSize(motivator.description || "", pageWidth - 100);
                pdf.text(lines, 80, y + 8 + titleLines.length * 16 + 8);

                y += 8 + titleLines.length * 16 + 8 + lines.length * 14 + 16;

                // Разделитель
                pdf.setDrawColor(200, 200, 200);
                pdf.line(40, y, pageWidth - 40, y);
                y += 16;
            });

            pdf.save("moving-motivators.pdf");
        }catch(err) {
            console.error("Ошибка при сохранении PDF:", err);
        }

    }

    return (
        <div className="w-9/12 mx-auto flex-col bg-white rounded-lg p-4 mt-5">
            <div className="w-full flex flex-row mx-auto px-11 py-3 justify-between ">
                <p className="headline4 ">Результаты</p>
                <div className="flex flex-row gap-1">
                    <button className="btn" onClick={savePdf}>
                        сохранить pdf
                    </button>
                    <Link to={`/moving/${id}`} className="btn w-12 flex items-center justify-center">
                        <img src={back} alt="back"/>
                    </Link>

                </div>

            </div>
            <div ref={contentRef} className="flex flex-col gap-4 w-11/12 mx-auto mt-5">
                {gameState.savedMotivators.map((motivator, i) => (
                    <div
                        key={motivator.id}
                        className="flex flex-row items-center bg-gray-100 p-3 rounded-lg border-gray-200 border-2 "
                    >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-r text-white from-[#a97fff] to-[#cf70ac] flex items-center justify-center">
                            {i+1}
                        </div>
                        <div className="flex flex-col w-11/12 ml-6">
                            <p className="headline5 text-left">{motivator.title}</p>
                            <p className="body2 text-[14px] text-gray-500 ">{motivator.description}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>

    );
});

export default SavePageOne;