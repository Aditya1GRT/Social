import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','😢','😡','😊','🤣',
  '😭','😤','🤩','😴','🤯','😏','🥳','😇','🫡','😮',
  '👍','👎','❤️','🔥','✨','🎉','🙏','💪','💯','🌟',
  '👏','🫶','💅','🤌','👀','💀','🎁','🍕','🐶','🌈',
];

const Panel = styled.div`
  position: fixed;
  z-index: 9999;
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.28);
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
  width: 260px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(6, 1fr);
    width: 200px;
  }
`;

const EmojiBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.15s;
  &:hover { background: rgba(${({ theme }) => theme.mainRgba}, 0.1); }
`;

export default function EmojiPicker({ onSelect, onClose, triggerRef, align = 'left' }) {
  const panelRef = useRef();
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!triggerRef?.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelW = window.innerWidth <= 480 ? 200 : 260;
    const panelH = 160;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    const top = spaceAbove > panelH || spaceAbove > spaceBelow
      ? rect.top - panelH - 6
      : rect.bottom + 6;

    let left = align === 'right'
      ? rect.right - panelW
      : rect.left;

    // keep panel inside viewport horizontally
    if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;
    if (left < 8) left = 8;

    setPos({ top: Math.max(8, top), left });
  }, [triggerRef, align]);

  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef?.current && !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, triggerRef]);

  return ReactDOM.createPortal(
    <Panel ref={panelRef} style={{ top: pos.top, left: pos.left }}>
      {EMOJIS.map(emoji => (
        <EmojiBtn
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          title={emoji}
        >
          {emoji}
        </EmojiBtn>
      ))}
    </Panel>,
    document.body
  );
}
