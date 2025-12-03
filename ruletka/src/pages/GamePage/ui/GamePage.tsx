import React, { useState } from 'react';
import { SlotMachine } from '@widgets/SlotMachine';
import { CasinoControlPanel } from '@widgets/CasinoControlPanel';
import { InfoPanel } from '@widgets/InfoPanel';
import { PaytableModal } from '@widgets/PaytableModal';
import { UserPanel } from '@widgets/UserPanel';
import { Button } from '@shared/ui/Button';
import { useGameStore } from '@entities/game';
import './GamePage.css';

export const GamePage: React.FC = () => {
  const [isPaytableOpen, setIsPaytableOpen] = useState(false);
  const {
    bet,
    balance,
    isSpinning,
    isBonusGame,
    freeSpinsLeft,
    isTurbo,
    spin,
    setBet,
    buyBonus,
    setTurbo,
  } = useGameStore();

  const handleBetIncrease = () => {
    setBet(bet + 1);
  };

  const handleBetDecrease = () => {
    setBet(bet - 1);
  };

  return (
    <div className="game-page">
      <header className="game-header">
        <h1 className="game-title">🎰 Слот Машина 🎰</h1>
        <Button 
          onClick={() => setIsPaytableOpen(true)}
          variant="secondary"
          className="info-button"
        >
          📊 Таблица выплат
        </Button>
      </header>
      
      <main className="game-content">
        <UserPanel />
        <InfoPanel />
        <SlotMachine />
        <CasinoControlPanel
          bet={bet}
          balance={balance}
          isSpinning={isSpinning}
          isBonusGame={isBonusGame}
          freeSpinsLeft={freeSpinsLeft}
          isTurbo={isTurbo}
          onSpin={spin}
          onBetIncrease={handleBetIncrease}
          onBetDecrease={handleBetDecrease}
          onTurboToggle={() => setTurbo(!isTurbo)}
          onBuyBonus={buyBonus}
          betStep={1}
          minBet={1}
          maxBet={100}
        />
      </main>
      
      <footer className="game-footer">
        <p>20 линий выигрыша • Бонусные игры • Wild символы</p>
      </footer>

      <PaytableModal 
        isOpen={isPaytableOpen} 
        onClose={() => setIsPaytableOpen(false)} 
      />
    </div>
  );
};

