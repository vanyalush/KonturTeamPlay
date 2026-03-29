
import gameState from "../../../store/GameState.js";
import {arrayMove} from "@dnd-kit/sortable";
import React, {useEffect, useState} from "react";
import {reaction} from "mobx";

export const useMotivators = (data, revealedCount) => {
    const [items, setItems] = useState(() =>
        data.slice(0, revealedCount).map(item => ({ ...item }))
    );

    useEffect(() => {
        gameState.setSavedMotivators(items);
    }, [items]);

    useEffect(() => {
        const currentIds = items.map(i => i.id);
        const allRevealed = data.slice(0, revealedCount);
        const newCards = allRevealed.filter(card => !currentIds.includes(card.id));

        setItems(prev => [...prev, ...newCards]);
    }, [data, revealedCount]);

    useEffect(() => {
        const dispose = reaction(
            () => gameState.syncOrder,
            (syncOrder) => {
                if (!syncOrder) return;
                const orderItems = syncOrder
                    .map(id => data.find(i => i.id === id))
                    .filter(Boolean);
                setItems(orderItems);
            },
            { fireImmediately: true }
        );
        return () => dispose();
    }, [data]);

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

    return {items, handleDragEnd};
}