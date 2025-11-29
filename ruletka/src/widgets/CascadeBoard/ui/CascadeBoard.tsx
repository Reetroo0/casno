import React, { useEffect, useState } from 'react';
import { useCascadeGameStore } from '@entities/cascade/model/store';
import { CascadeSymbolType } from '@shared/types/cascade';
import { CascadeCell } from './CascadeCell';
import './CascadeBoard.css';

export const CascadeBoard: React.FC = () => {
  const { board, isSpinning, isResolving, cascades, currentCascadeIndex } = useCascadeGameStore();
  const [displayBoard, setDisplayBoard] = useState<number[][]>(board);
  const [explodingCells, setExplodingCells] = useState<Set<string>>(new Set());
  const [fallingSymbols, setFallingSymbols] = useState<Map<string, { from: number; to: number }>>(new Map());
  const [spinningColumns, setSpinningColumns] = useState<Set<number>>(new Set()); // Столбцы, которые вращаются
  const [stoppedColumns, setStoppedColumns] = useState<Set<number>>(new Set()); // Столбцы, которые остановились
  const [finalBoard, setFinalBoard] = useState<number[][] | null>(null); // Финальная доска после спина

  // Анимация спина в стиле Sugar Rush - символы вращаются, столбцы останавливаются слева направо
  useEffect(() => {
    if (isSpinning && !isResolving) {
      // Сохраняем финальную доску
      const finalBoardData = board.map(row => [...row]);
      setFinalBoard(finalBoardData);
      
      // Все столбцы начинают вращаться одновременно
      const allColumns = new Set<number>();
      for (let col = 0; col < 7; col++) {
        allColumns.add(col);
      }
      setSpinningColumns(allColumns);
      setStoppedColumns(new Set());
      
      // Столбцы останавливаются последовательно слева направо
      const spinDuration = 2000; // 2 секунды базового вращения
      const stopDelay = 200; // 200ms между остановками столбцов
      
      for (let col = 0; col < 7; col++) {
        setTimeout(() => {
          setStoppedColumns(prev => {
            const newSet = new Set(prev);
            newSet.add(col);
            return newSet;
          });
          setSpinningColumns(prev => {
            const newSet = new Set(prev);
            newSet.delete(col);
            return newSet;
          });
        }, spinDuration + col * stopDelay);
      }
      
      // После остановки всех столбцов показываем финальную доску
      const totalDuration = spinDuration + 7 * stopDelay + 300; // +300ms для завершения анимации
      const finalTimer = setTimeout(() => {
        setDisplayBoard(finalBoardData);
        setSpinningColumns(new Set());
        setStoppedColumns(new Set());
        setFinalBoard(null);
      }, totalDuration);
      
      return () => {
        clearTimeout(finalTimer);
        setSpinningColumns(new Set());
        setStoppedColumns(new Set());
        setFinalBoard(null);
      };
    }
  }, [isSpinning, isResolving, board]);

  // Синхронизируем displayBoard с board при изменении начальной доски
  useEffect(() => {
    if (!isSpinning && !isResolving && currentCascadeIndex < 0) {
      setDisplayBoard(board.map(row => [...row]));
      setExplodingCells(new Set());
      setFallingSymbols(new Map());
      setSpinningColumns(new Set());
      setStoppedColumns(new Set());
      setFinalBoard(null);
    }
  }, [board, isSpinning, isResolving, currentCascadeIndex]);

  // Синхронизируем displayBoard когда начинается каскад (currentCascadeIndex становится 0)
  useEffect(() => {
    if (isResolving && currentCascadeIndex === 0) {
      setDisplayBoard(board.map(row => [...row]));
      setExplodingCells(new Set());
      setFallingSymbols(new Map());
    }
  }, [isResolving, currentCascadeIndex, board]);

  // Обрабатываем каскады
  useEffect(() => {
    if (isResolving && cascades.length > 0 && currentCascadeIndex >= 0) {
      const cascade = cascades[currentCascadeIndex];
      
      // Помечаем ячейки для подсветки (вместо взрыва)
      const newHighlighted = new Set<string>();
      cascade.clusters.forEach((cluster: any) => {
        // Отладочный вывод для проверки всех ячеек кластера
        console.log(`Cluster symbol ${cluster.symbol}, count: ${cluster.count}, cells:`, cluster.cells);
        cluster.cells.forEach((cell: any) => {
          const cellKey = `${cell.row}-${cell.col}`;
          newHighlighted.add(cellKey);
          console.log(`Adding cell to highlight: row=${cell.row}, col=${cell.col}, key=${cellKey}`);
        });
      });
      console.log(`Total highlighted cells: ${newHighlighted.size}`);
      setExplodingCells(newHighlighted); // Используем то же состояние, но для подсветки

      // Шаг 1: Подсветка кластеров (1500ms - показываем комбинацию)
      const highlightTimer = setTimeout(() => {
        // После подсветки удаляем ячейки кластеров и ОЧИЩАЕМ подсветку
        setExplodingCells(new Set()); // Очищаем подсветку ПЕРЕД удалением
        setDisplayBoard(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          cascade.clusters.forEach((cluster: any) => {
            cluster.cells.forEach((cell: any) => {
              newBoard[cell.row][cell.col] = -1; // Пусто
            });
          });
          return newBoard;
        });

        // Шаг 2: Применяем гравитацию - символы падают вниз в столбцах (800ms - более плавно)
        const gravityTimer = setTimeout(() => {
          // Сначала показываем анимацию падения для всех символов
          setDisplayBoard(prevBoard => {
            const newBoard = prevBoard.map(row => [...row]);
            const BOARD_SIZE = 7;
            
            // Для каждого столбца применяем гравитацию постепенно
            for (let col = 0; col < BOARD_SIZE; col++) {
              const column: number[] = [];
              // Собираем все непустые символы в столбце (снизу вверх)
              for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                if (newBoard[row][col] !== -1) {
                  column.push(newBoard[row][col]);
                }
              }
              // Заполняем столбец снизу вверх
              for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                const index = BOARD_SIZE - 1 - row;
                newBoard[row][col] = index < column.length ? column[index] : -1;
              }
            }
            
            return newBoard;
          });

          // Шаг 3: Анимация появления новых символов сверху (600ms - более плавно)
          const newSymbolsTimer = setTimeout(() => {
            // Убеждаемся, что подсветка очищена перед добавлением новых символов
            setExplodingCells(new Set());
            
            const falling = new Map<string, { from: number; to: number }>();
            cascade.new_symbols.forEach((newSymbol: any) => {
              if (newSymbol.symbol !== -1) {
                const key = `${newSymbol.position.row}-${newSymbol.position.col}`;
                // Новые символы падают сверху (row = -1 означает сверху)
                falling.set(key, { from: -1, to: newSymbol.position.row });
              }
            });
            setFallingSymbols(falling);

            // Шаг 4: Обновляем доску с новыми символами (800ms - более плавно)
            const finalTimer = setTimeout(() => {
              setDisplayBoard(prevBoard => {
                const newBoard = prevBoard.map(row => [...row]);
                // Сначала применяем гравитацию к существующим символам
                const BOARD_SIZE = 7;
                for (let col = 0; col < BOARD_SIZE; col++) {
                  const column: number[] = [];
                  // Собираем все непустые символы в столбце (снизу вверх)
                  for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                    if (newBoard[row][col] !== -1) {
                      column.push(newBoard[row][col]);
                    }
                  }
                  // Заполняем столбец снизу вверх
                  for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                    const index = BOARD_SIZE - 1 - row;
                    newBoard[row][col] = index < column.length ? column[index] : -1;
                  }
                }
                
                // Затем добавляем новые символы
                cascade.new_symbols.forEach((newSymbol: any) => {
                  if (newSymbol.symbol !== -1) {
                    newBoard[newSymbol.position.row][newSymbol.position.col] = newSymbol.symbol;
                  }
                });
                return newBoard;
              });
              setFallingSymbols(new Map());
              // Убеждаемся, что подсветка очищена после добавления символов
              setExplodingCells(new Set());
            }, 800);

            return () => clearTimeout(finalTimer);
          }, 600);

          return () => clearTimeout(newSymbolsTimer);
        }, 800);

        return () => clearTimeout(gravityTimer);
      }, 1500); // Увеличиваем время подсветки

      return () => clearTimeout(highlightTimer);
    }
  }, [currentCascadeIndex, cascades, isResolving]);

  const getSymbolEmoji = (symbol: number): string => {
    switch (symbol) {
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
  };

  return (
    <div className="cascade-board">
      <div className="cascade-grid-container">
        <div className="cascade-grid">
          {displayBoard.map((row, rowIndex) =>
            row.map((symbol, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const isHighlighted = explodingCells.has(cellKey);
              const falling = fallingSymbols.get(cellKey);
              const isSpinning = spinningColumns.has(colIndex);
              const isStopped = stoppedColumns.has(colIndex);
              
              // Во время спина показываем финальный символ, если столбец остановился
              const displaySymbol = finalBoard && isStopped 
                ? finalBoard[rowIndex][colIndex] 
                : symbol;
              
              return (
                <CascadeCell
                  key={cellKey}
                  symbol={displaySymbol}
                  emoji={getSymbolEmoji(displaySymbol)}
                  row={rowIndex}
                  col={colIndex}
                  isHighlighted={isHighlighted}
                  isFalling={falling !== undefined}
                  fallingFrom={falling?.from}
                  fallingTo={falling?.to}
                  isSpinning={isSpinning && !isStopped}
                  finalSymbol={finalBoard ? finalBoard[rowIndex][colIndex] : undefined}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

