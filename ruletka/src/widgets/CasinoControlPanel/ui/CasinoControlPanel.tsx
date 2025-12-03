import React, { useEffect } from 'react';
import './CasinoControlPanel.css';

export interface CasinoControlPanelProps {
  // Game state
  bet: number;
  balance: number;
  isSpinning: boolean;
  isResolving?: boolean; // Для cascade игры
  isBonusGame: boolean;
  freeSpinsLeft: number;
  isTurbo: boolean;
  
  // Actions
  onSpin: () => void;
  onBetIncrease: () => void;
  onBetDecrease: () => void;
  onTurboToggle: () => void;
  onBuyBonus: () => void;
  
  // Configuration
  betStep?: number; // Шаг изменения ставки (1 для обычных слотов, 2 для cascade)
  minBet?: number;
  maxBet?: number;
}

export const CasinoControlPanel: React.FC<CasinoControlPanelProps> = ({
  bet,
  balance,
  isSpinning,
  isResolving = false,
  isBonusGame,
  freeSpinsLeft,
  isTurbo,
  onSpin,
  onBetIncrease,
  onBetDecrease,
  onTurboToggle,
  onBuyBonus,
  betStep = 1,
  minBet = 1,
  maxBet = 100,
}) => {
  // Привязка к пробелу
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && !isResolving && (balance >= bet || isBonusGame)) {
        e.preventDefault();
        onSpin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSpin, isSpinning, isResolving, balance, bet, isBonusGame]);

  const canSpin = (balance >= bet || isBonusGame) && !isSpinning && !isResolving;
  const canBuyBonus = balance >= bet * 100 && !isBonusGame && !isSpinning && !isResolving;
  const canDecreaseBet = bet > minBet && !isSpinning && !isResolving;
  const canIncreaseBet = bet < maxBet && !isSpinning && !isResolving;

  return (
    <div className="casino-control-panel">
      {/* Кнопка уменьшения ставки */}
      <button
        className="casino-button bet-decrease"
        onClick={onBetDecrease}
        disabled={!canDecreaseBet}
        title="Уменьшить ставку"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Отображение ставки */}
      <div className="bet-display">
        <span className="bet-label">Ставка</span>
        <span className="bet-value">{bet}</span>
      </div>

      {/* Кнопка увеличения ставки */}
      <button
        className="casino-button bet-increase"
        onClick={onBetIncrease}
        disabled={!canIncreaseBet}
        title="Увеличить ставку"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Кнопка спина */}
      <button
        className="casino-button spin-button"
        onClick={onSpin}
        disabled={!canSpin}
        title={isSpinning ? 'Вращение...' : isResolving ? 'Каскад...' : isBonusGame ? `Фриспин (${freeSpinsLeft})` : 'Крутить'}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="button-label">
          {isSpinning ? 'Вращение...' : isResolving ? 'Каскад...' : isBonusGame ? `Фриспин (${freeSpinsLeft})` : 'Крутить'}
        </span>
      </button>

      {/* Кнопка турбо */}
      <button
        className={`casino-button turbo-button ${isTurbo ? 'active' : ''}`}
        onClick={onTurboToggle}
        disabled={isSpinning || isResolving}
        title={isTurbo ? 'Турбо режим включен' : 'Включить турбо режим'}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="button-label">Турбо</span>
      </button>

      {/* Кнопка покупки бонуса */}
      <button
        className="casino-button bonus-button"
        onClick={onBuyBonus}
        disabled={!canBuyBonus}
        title={`Купить бонус за ${bet * 100}`}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8V4M12 4L9 7M12 4L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="14" r="2" fill="currentColor"/>
        </svg>
        <span className="button-label">Бонус</span>
      </button>
    </div>
  );
};

