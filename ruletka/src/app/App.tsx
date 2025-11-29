import React, { useState } from 'react';
import { GamePage } from '@pages/GamePage';
import { CascadeGamePage } from '@pages/CascadeGamePage';
import { Button } from '@shared/ui/Button';
import './styles/index.css';
import './App.css';

export const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<'line' | 'cascade'>('cascade');

  return (
    <div className="app-container">
      <nav className="game-selector">
        <Button
          onClick={() => setCurrentGame('line')}
          variant={currentGame === 'line' ? 'primary' : 'secondary'}
          className="game-selector-button"
        >
          🎰 Слот-машина (Линии)
        </Button>
        <Button
          onClick={() => setCurrentGame('cascade')}
          variant={currentGame === 'cascade' ? 'primary' : 'secondary'}
          className="game-selector-button"
        >
          🍬 SugarRash (Каскад)
        </Button>
      </nav>
      
      {currentGame === 'line' ? <GamePage /> : <CascadeGamePage />}
    </div>
  );
};

