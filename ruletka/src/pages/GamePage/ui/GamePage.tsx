import React, { useState } from 'react';
import { SlotMachine } from '@widgets/SlotMachine';
import { ControlPanel } from '@widgets/ControlPanel';
import { InfoPanel } from '@widgets/InfoPanel';
import { PaytableModal } from '@widgets/PaytableModal';
import { UserPanel } from '@widgets/UserPanel';
import { Button } from '@shared/ui/Button';
import './GamePage.css';

export const GamePage: React.FC = () => {
  const [isPaytableOpen, setIsPaytableOpen] = useState(false);

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
        <ControlPanel />
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

