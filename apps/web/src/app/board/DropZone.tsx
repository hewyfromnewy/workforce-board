import { useDrop } from 'react-dnd';
import { RESOURCE_DND, type ResourceDragItem } from './ResourceTag';

/** A drop target for resource tags; calls onDrop with the dragged resource id. */
export function Drop({
  onDrop,
  className,
  style,
  children,
}: {
  onDrop: (resourceId: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [{ over }, drop] = useDrop(
    () => ({
      accept: RESOURCE_DND,
      drop: (item: ResourceDragItem) => onDrop(item.resourceId),
      collect: (m) => ({ over: m.isOver() }),
    }),
    [onDrop],
  );
  return (
    <div ref={drop} className={`${className ?? ''} ${over ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`} style={style}>
      {children}
    </div>
  );
}
