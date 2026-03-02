import React, {useEffect, useState} from 'react';
import {arrayMove, rectSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {closestCenter, DndContext, PointerSensor} from "@dnd-kit/core";
import {SortableImprov} from "./SortableImprov.jsx";
import gameState from "../../store/GameState.js";
import {observer} from "mobx-react-lite";

const initialItems = Array.from({length: 45}, (_, i) => ({
        id: String(i+1),
        img: `https://management30.com/wp-content/uploads/2021/06/Management30_ImprovCards_400px-${i+10}.png`
}));

const ImprovsContainer = observer(({isSwap, isBlind}) => {
    const [items, setItems] = useState(initialItems);
    useEffect(() => {
        if(!gameState.socket) return;

        const handler = (e) => {
            const msg = JSON.parse(e.data);
            if(msg.method === "syncOrder") {
                setItems(msg.order.map(id => initialItems.find(item => item.id === id)))
            }
        }

        gameState.socket.addEventListener("message", handler);
        return () => {gameState.socket.removeEventListener("message", handler);}
    }, [gameState.socket]);

    useEffect(() => {
        if (isBlind) {
            const shuffled = [...items].sort(() => Math.random() - 0.5);
            setItems(shuffled);
            sendOrder(shuffled);
        }
    }, [isBlind]);

    const sendOrder = (newItems) => {
        if (gameState.socket?.readyState === WebSocket.OPEN) {
            gameState.socket.send(JSON.stringify({
                method: "updateOrder",
                sessionId: gameState.sessionId,
                order: newItems.map(i => i.id)
            }));
        }
    }

    const handleDragEnd = ({active, over}) => {
        if (!over || active.id === over.id) return;

        setItems((prev) => {
            const oldIndex = prev.findIndex((item) => item.id === active.id);
            const newIndex = prev.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(prev, oldIndex, newIndex);
            sendOrder(newItems);
            return newItems;
        });
    }

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            disabled={!isSwap || !gameState.isEditing}
        >
            <SortableContext
                items={items.map((i => i.id))}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-5 gap-4 mt-8 pb-2">
                    {items.map((i) => (
                        <SortableImprov key={i.id} id={i.id} img={i.img} isEditing={isSwap && gameState.isEditing} isSwap={isSwap} isBlind={isBlind}/>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
});

export default ImprovsContainer;