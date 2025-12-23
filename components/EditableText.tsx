import React, { useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  as?: React.ElementType;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onSave, 
  className = '', 
  as: Tag = 'span',
  multiline = false
}) => {
  const ref = useRef<HTMLElement>(null);

  // When value prop changes externally, update the text content if not currently focused
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerText = value;
    }
  }, [value]);

  const handleBlur = () => {
    if (ref.current) {
      const newValue = ref.current.innerText;
      if (newValue !== value) {
        onSave(newValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      ref.current?.blur();
    }
  };

  return (
    <Tag
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      className={`outline-none min-w-[1ch] empty:before:content-['...'] empty:before:opacity-50 focus:bg-white/10 transition-colors rounded px-1 -mx-1 ${className}`}
    >
      {value}
    </Tag>
  );
};