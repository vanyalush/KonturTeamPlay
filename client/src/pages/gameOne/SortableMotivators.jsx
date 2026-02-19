import {useSortable} from "@dnd-kit/sortable";
import Motivator from "./Motivator.jsx";
import { CSS } from "@dnd-kit/utilities";

export const SortableMotivator = ({motivator, isEditing}) => {
    const{
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: motivator.id,
        disabled: !isEditing
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.85 : 1,
        cursor: isEditing ? "grab" : "default",
        touchAction: "none",
        pointerEvents: isEditing ? "auto" : "none",
    }
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isEditing ? {...attributes, ...listeners} : {})}
        >
            <Motivator {...motivator} />
        </div>
    )
}