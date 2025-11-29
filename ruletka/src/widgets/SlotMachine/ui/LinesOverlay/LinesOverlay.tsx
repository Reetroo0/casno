import React, { useState, useEffect } from 'react';
import { WinningLine } from '@shared/types/game';
import './LinesOverlay.css';

interface LinesOverlayProps {
  winningLines: WinningLine[];
}

export const LinesOverlay: React.FC<LinesOverlayProps> = ({ winningLines }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  
  // Сбрасываем индекс когда массив изменяется
  useEffect(() => {
    if (winningLines.length === 0) {
      setCurrentLineIndex(0);
      return;
    }
    
    // Убеждаемся, что индекс в пределах массива
    if (currentLineIndex >= winningLines.length) {
      setCurrentLineIndex(0);
    }
  }, [winningLines, currentLineIndex]);
  
  useEffect(() => {
    if (winningLines.length === 0) return;
    
    // Циклическая анимация через все выигрышные линии
    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => {
        if (winningLines.length === 0) return 0;
        return (prev + 1) % winningLines.length;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, [winningLines.length]);
  
  if (winningLines.length === 0) return null;

  // Безопасная проверка существования элемента
  const currentLine = winningLines[currentLineIndex];
  if (!currentLine) return null;

  return (
    <>
      {/* Счетчик линий */}
      <div className="lines-overlay">
        <div className="lines-counter">
          <span className="lines-label">Выигрышных линий:</span>
          <span className="lines-count">{winningLines.length}</span>
        </div>
      </div>
      
      {/* Индикатор текущей линии */}
      {winningLines.length > 1 && (
        <div className="line-indicator">
          <span className="line-number">
            {currentLine.lineIndex === -1 
              ? 'Бонус' 
              : `Линия ${currentLine.lineIndex}`}
          </span>
          <span className="line-win">
            +{currentLine.winAmount}
          </span>
        </div>
      )}
    </>
  );
};

