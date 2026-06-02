import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','😢','😡','😊','🤣',
  '😭','😤','🤩','😴','🤯','😏','🥳','😇','🫡','😮',
  '👍','👎','❤️','🔥','✨','🎉','🙏','💪','💯','🌟',
  '👏','🫶','💅','🤌','👀','💀','🎁','🍕','🐶','🌈',
];

const Panel = styled.div`
  position: absolute;
  z-index: 300;
  bottom: calc(100% + 6px);
  ${({ $align }) => $align === 'right' ? 'right: 0;' : 'left: 0;'}
  background: rgba(${({ theme }) => theme.bodyRgba}, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(${({ theme }) => theme.mainRgba}, 0.15);
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.18);
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

export default function EmojiPicker({ onSelect, onClose, align = 'left' }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <Panel ref={ref} $align={align}>
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
    </Panel>
  );
}
