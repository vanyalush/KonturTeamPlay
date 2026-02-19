import React from 'react';
import {closestCenter, DndContext} from "@dnd-kit/core";
import {rectSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {observer} from "mobx-react-lite";
import gameState from "../../store/GameState.js";
import {SortableMotivator} from "./SortableMotivators.jsx";
import {useMotivators} from "./hooks/useMotivators.js";

const Motivators = observer(({data, revealedCount}) => {
    const {items, handleDragEnd} = useMotivators(data, revealedCount);

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            disabled={!gameState.isEditing}
        >
            <SortableContext
                items={items.map(i =>i.id)}
                strategy={rectSortingStrategy}
            >
                <div className="mt-6 grid grid-cols-4 gap-5">
                    {items.map((motivator) => (
                        <SortableMotivator key={motivator.id} motivator={motivator} isEditing={gameState.isEditing} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
})

export default Motivators;