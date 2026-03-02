import {useSortable} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ImprovCard from "./ImprovCard.jsx";

export const SortableImprov = ({id, img, isEditing, isBlind}) => {
    const{
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: id,
        disabled: !isEditing,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.85 : 1,
        cursor: isEditing ? "grab" : "default",
        touchAction: "none",
    }
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isEditing ? {...attributes, ...listeners} : {})}
        >
            <ImprovCard img={img} isBlind={isBlind} id={id}/>
        </div>
    )
}