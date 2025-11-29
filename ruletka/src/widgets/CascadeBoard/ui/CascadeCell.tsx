import React from 'react';
import { CascadeSymbolType } from '@shared/types/cascade';
import './CascadeCell.css';

interface CascadeCellProps {
  symbol: number;
  emoji: string;
  row: number;
  col: number;
  isHighlighted?: boolean;
  isFalling?: boolean;
  fallingFrom?: number;
  fallingTo?: number;
  isSpinning?: boolean;
  finalSymbol?: number;
  isTurbo?: boolean;
}

export const CascadeCell: React.FC<CascadeCellProps> = ({
  symbol,
  emoji,
  row,
  col,
  isHighlighted,
  isFalling,
  fallingFrom,
  fallingTo,
  isSpinning,
  finalSymbol,
  isTurbo = false,
}) => {
  const isEmpty = symbol === -1;
  
  // Функция для получения эмодзи символа
  function getSymbolEmoji(sym: number): string {
    switch (sym) {
      case CascadeSymbolType.EMPTY:
        return '';
      case CascadeSymbolType.SYMBOL_0:
        return '🍒';
      case CascadeSymbolType.SYMBOL_1:
        return '🍋';
      case CascadeSymbolType.SYMBOL_2:
        return '🍊';
      case CascadeSymbolType.SYMBOL_3:
        return '🍇';
      case CascadeSymbolType.SYMBOL_4:
        return '🍉';
      case CascadeSymbolType.SYMBOL_5:
        return '💎';
      case CascadeSymbolType.SYMBOL_6:
        return '⭐';
      case CascadeSymbolType.SCATTER:
        return '🎁';
      default:
        return '❓';
    }
  }
  
  const finalEmoji = finalSymbol !== undefined ? getSymbolEmoji(finalSymbol) : emoji;
  
  // Создаем реель с символами для вращения
  const reelSymbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '💎', '⭐', '🎁'];
  const reelItems = [];
  // Добавляем случайные символы для эффекта вращения
  for (let i = 0; i < 8; i++) {
    reelItems.push(reelSymbols[Math.floor(Math.random() * reelSymbols.length)]);
  }
  // Последний символ - финальный
  reelItems.push(finalEmoji);
  // Добавляем еще несколько для плавности
  for (let i = 0; i < 3; i++) {
    reelItems.push(reelSymbols[Math.floor(Math.random() * reelSymbols.length)]);
  }

  return (
    <div
      className={`cascade-cell ${isEmpty ? 'empty' : ''} ${isHighlighted ? 'highlighted' : ''} ${isFalling ? 'falling' : ''} ${isSpinning ? 'spinning' : ''} ${isTurbo && isSpinning ? 'turbo' : ''}`}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
      }}
    >
      {!isEmpty && (
        <div className={`cascade-symbol ${isSpinning ? 'symbol-reel' : ''}`}>
          {isSpinning ? (
            <div className="symbol-reel-container">
              {reelItems.map((item, index) => (
                <div key={index} className="symbol-reel-item">{item}</div>
              ))}
            </div>
          ) : (
            emoji
          )}
        </div>
      )}
    </div>
  );
};

