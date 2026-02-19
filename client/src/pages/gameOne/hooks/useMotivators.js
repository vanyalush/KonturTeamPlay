
import gameState from "../../../store/GameState.js";
import {arrayMove} from "@dnd-kit/sortable";
import React, {useEffect, useState} from "react";

export const useMotivators = (data, revealedCount) => {
    const [items, setItems] = useState(() =>
        data.slice(0, revealedCount).map(item => ({ ...item }))
    );

    useEffect(() => {
        const currentIds = items.map(i => i.id);
        const allRevealed = data.slice(0, revealedCount);
        const newCards = allRevealed.filter(card => !currentIds.includes(card.id));

        setItems(prev => [...prev, ...newCards]);
    }, [data, revealedCount]);

    const handleDragEnd = (event) => {
        if(!gameState.isEditing || !gameState.socket) return;

        const {active, over} = event;
        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const newItems =  arrayMove(items, oldIndex, newIndex);

                gameState.socket.send(JSON.stringify({
                    method: "updateOrder",
                    sessionId:gameState.sessionId,
                    order: newItems.map((i) => i.id)
                }))

                return newItems;
            });
        }
    }

    useEffect(() => {
        const socket = gameState.socket;
        if(!socket) return;

        const handleMessage = (e) => {
            const msg = JSON.parse(e.data);
            if(msg.method === "syncOrder") {
                const orderItems = msg.order.map(id =>
                    data.find(i => i.id === id)
                ).filter(Boolean);

                setItems(orderItems);
            }
        };
        socket.addEventListener("message", handleMessage);
        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [data])

    return {items, handleDragEnd};
}