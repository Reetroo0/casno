import { create } from 'zustand';
import { GameState, Symbol } from '@shared/types/game';
import { GAME_CONFIG } from '@shared/config/payouts';
import { generateAllReels, generateBonusBuyReels } from '@shared/lib/symbolGenerator';
import { calculateWins, shouldTriggerBonusGame, getFreeSpinsCount } from '@shared/lib/winCalculator';
import { GameAPI, UserAPI } from '@shared/api';

interface GameStore extends GameState {
  // Actions
  spin: () => void;
  setBet: (bet: number) => void;
  buyBonus: () => void;
  reset: () => void;
  updateReels: (reels: Symbol[][]) => void;
  deposit: (amount: number) => Promise<void>;
  syncBalance: () => Promise<void>;
  useOnlineMode: boolean;
  setOnlineMode: (online: boolean) => void;
  isTurbo: boolean;
  setTurbo: (turbo: boolean) => void;
}

// Генерируем начальные символы для барабанов
const generateInitialReels = () => {
  return Array(GAME_CONFIG.REELS)
    .fill(null)
    .map((_, index) => ({
      symbols: generateAllReels(false, false)[index],
      position: index,
    }));
};

const initialState: GameState = {
  reels: generateInitialReels(),
  balance: GAME_CONFIG.DEFAULT_BALANCE,
  bet: GAME_CONFIG.DEFAULT_BET,
  isSpinning: false,
  isBonusGame: false,
  freeSpinsLeft: 0,
  lastWin: 0,
  totalWin: 0,
  winningLines: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  useOnlineMode: false,
  isTurbo: false,

  setTurbo: (turbo: boolean) => {
    set({ isTurbo: turbo });
  },

  setOnlineMode: (online: boolean) => {
    set({ useOnlineMode: online });
  },

  syncBalance: async () => {
    const state = get();
    if (!state.useOnlineMode) return;

    try {
      const userData = await UserAPI.getUserData();
      set({ 
        balance: userData.balance,
        freeSpinsLeft: userData.freeSpinCount,
        isBonusGame: userData.freeSpinCount > 0,
      });
    } catch (error) {
      console.error('Failed to sync balance:', error);
    }
  },

  deposit: async (amount: number) => {
    const state = get();
    
    if (state.useOnlineMode) {
      try {
        await UserAPI.deposit(amount);
        // После депозита получаем обновленные данные
        const userData = await UserAPI.getUserData();
        set({ 
          balance: userData.balance,
          freeSpinsLeft: userData.freeSpinCount,
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Ошибка при пополнении баланса');
        throw error;
      }
    } else {
      // Оффлайн режим - просто добавляем к балансу
      set({ balance: state.balance + amount });
    }
  },

  spin: async () => {
    const state = get();
    
    if (state.isSpinning) return;
    
    // Проверяем баланс
    if (!state.isBonusGame && state.balance < state.bet) {
      alert('Недостаточно средств!');
      return;
    }

    set({ isSpinning: true, winningLines: [], lastWin: 0 });

    // Определяем длительность спина в зависимости от режима
    const spinDuration = state.isTurbo ? 100 : GAME_CONFIG.SPIN_DURATION;

    // Если используем онлайн режим и не бонусная игра
    if (state.useOnlineMode && !state.isBonusGame) {
      try {
        // Отправляем запрос на спин к API
        const result = await GameAPI.spin(state.bet);
        
        // Имитируем вращение
        setTimeout(() => {
          console.log('🎯 Setting game state with winning lines:', result.winningLines);
          
          const currentState = get();
          const newFreeSpinsLeft = currentState.freeSpinsLeft > 0 
            ? currentState.freeSpinsLeft - 1 
            : (result.freeSpinCount > 0 ? result.freeSpinCount : 0);
          
          set({
            reels: result.reels.map((symbols, index) => ({
              symbols,
              position: index,
            })),
            lastWin: result.winAmount,
            totalWin: currentState.totalWin + result.winAmount,
            balance: result.balance,
            winningLines: result.winningLines,
            isSpinning: false,
            freeSpinsLeft: newFreeSpinsLeft,
            isBonusGame: newFreeSpinsLeft > 0,
          });

          // Если начислены новые фриспины, показываем уведомление
          if (result.awardedFreeSpins > 0) {
            alert(`Вы выиграли ${result.awardedFreeSpins} бесплатных вращений!`);
          }

          // Если были скаттеры, можем показать дополнительную информацию
          if (result.scatterCount >= 3) {
            console.log(`Скаттеров: ${result.scatterCount}, выплата: ${result.scatterPayout}`);
          }
        }, spinDuration);

      } catch (error) {
        set({ isSpinning: false });
        alert(error instanceof Error ? error.message : 'Ошибка при спине');
        return;
      }
    } else {
      // Оффлайн режим или бонусная игра - используем локальную логику
      if (!state.isBonusGame) {
        set({ balance: state.balance - state.bet });
      }

      // Генерируем результат сразу
      const newReels = generateAllReels(state.isBonusGame, state.isBonusGame);
      const { winningLines, totalWin, bonusSymbolsCount } = calculateWins(newReels, state.bet);
      
      const flatReels = newReels.map(reel => reel);

      // Имитируем вращение - длительность учитывает задержку последнего барабана
      setTimeout(() => {
        const currentState = get();
        
        // Уменьшаем фриспины если они были
        let newFreeSpinsLeft = currentState.freeSpinsLeft;
        let newIsBonusGame = currentState.isBonusGame;
        
        if (currentState.freeSpinsLeft > 0) {
          newFreeSpinsLeft = currentState.freeSpinsLeft - 1;
          if (newFreeSpinsLeft === 0) {
            newIsBonusGame = false;
          }
        }
        
        // Проверяем триггер новой бонусной игры
        if (shouldTriggerBonusGame(bonusSymbolsCount)) {
          const newFreeSpins = getFreeSpinsCount(bonusSymbolsCount);
          newFreeSpinsLeft = newFreeSpinsLeft + newFreeSpins;
          newIsBonusGame = true;
        }
        
        set({
          reels: flatReels.map((symbols, index) => ({
            symbols,
            position: index,
          })),
          lastWin: totalWin,
          totalWin: currentState.totalWin + totalWin,
          balance: currentState.balance + totalWin,
          winningLines,
          isSpinning: false,
          freeSpinsLeft: newFreeSpinsLeft,
          isBonusGame: newIsBonusGame,
        });
      }, spinDuration);
    }
  },

  setBet: (bet: number) => {
    const state = get();
    if (state.isSpinning) return;
    
    const clampedBet = Math.max(
      GAME_CONFIG.MIN_BET,
      Math.min(GAME_CONFIG.MAX_BET, bet)
    );
    
    set({ bet: clampedBet });
  },

  buyBonus: async () => {
    const state = get();
    
    if (state.isSpinning || state.isBonusGame) return;
    
    const bonusCost = state.bet * 100;
    
    if (state.balance < bonusCost) {
      alert('Недостаточно средств для покупки бонуса!');
      return;
    }

    set({ 
      isSpinning: true,
      winningLines: [],
      lastWin: 0,
    });

    // Если онлайн режим, используем API
    if (state.useOnlineMode) {
      try {
        await GameAPI.buyBonus(bonusCost);
        // После покупки бонуса получаем обновленные данные
        const userData = await UserAPI.getUserData();
        set({ 
          balance: userData.balance,
          freeSpinsLeft: userData.freeSpinCount,
          isBonusGame: userData.freeSpinCount > 0,
          isSpinning: false,
        });
        
        if (userData.freeSpinCount > 0) {
          alert(`Бонус куплен! У вас ${userData.freeSpinCount} бесплатных вращений!`);
        }
      } catch (error) {
        set({ isSpinning: false });
        alert(error instanceof Error ? error.message : 'Ошибка при покупке бонуса');
        return;
      }
    } else {
      // Оффлайн режим - используем локальную логику
      set({ balance: state.balance - bonusCost });

      // Генерируем барабаны с гарантированными бонусными символами
      setTimeout(() => {
        const newReels = generateBonusBuyReels();
        const { winningLines, totalWin, bonusSymbolsCount } = calculateWins(newReels, state.bet);
        
        const flatReels = newReels.map(reel => reel);
        
        const newFreeSpins = getFreeSpinsCount(bonusSymbolsCount);
        
        set({
          reels: flatReels.map((symbols, index) => ({
            symbols,
            position: index,
          })),
          lastWin: totalWin,
          totalWin: state.totalWin + totalWin,
          balance: get().balance + totalWin,
          winningLines,
          isSpinning: false,
          isBonusGame: true,
          freeSpinsLeft: newFreeSpins,
        });
      }, GAME_CONFIG.SPIN_DURATION);
    }
  },

  reset: () => {
    set(initialState);
  },

  updateReels: (reels: Symbol[][]) => {
    set({
      reels: reels.map((symbols, index) => ({
        symbols,
        position: index,
      })),
    });
  },
}));

