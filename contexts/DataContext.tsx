import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Config, Level, Trade, JournalEntry, PairData } from '../types';
import { calculateLevelDerivedData, calculateTradeMetrics } from '../utils/calculations';

interface DataContextType {
  config: Config;
  levels: Level[];
  trades: Trade[];
  journalEntries: JournalEntry[];
  updateConfig: (newConfig: Partial<Config>) => void;
  addLevel: (level: Omit<Level, 'id'>) => void;
  updateLevel: (updatedLevel: Level) => void;
  deleteLevel: (levelId: string) => void;
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (updatedTrade: Trade) => void;
  deleteTrade: (tradeId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (updatedEntry: JournalEntry) => void;
  deleteJournalEntry: (entryId: string) => void;
  currentBalance: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialPairs: PairData[] = [
    { id: 'XAUJPY', name: 'XAUJPY', pipSize: 0.01, pipValuePerLot: 1000, spread: 0.30, slippage: 0.05 },
    { id: 'XAUUSD', name: 'XAUUSD', pipSize: 0.01, pipValuePerLot: 10, spread: 0.20, slippage: 0.05 },
    { id: 'EURUSD', name: 'EURUSD', pipSize: 0.0001, pipValuePerLot: 10, spread: 0.00015, slippage: 0.00005 },
];

const initialConfig: Config = {
  initialBalance: 10000,
  riskPerTrade: 0.01, // 1%
  alpha: 0.382,
  beta: 0.618,
  gamma: 0.1,
  pairs: initialPairs,
  timeframes: ['M5', 'M15'],
};

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<Config>(() => getInitialState('fimathe_config', initialConfig));
  const [levels, setLevels] = useState<Level[]>(() => getInitialState('fimathe_levels', []));
  const [trades, setTrades] = useState<Trade[]>(() => getInitialState('fimathe_trades', []));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => getInitialState('fimathe_journal', []));

  useEffect(() => {
    localStorage.setItem('fimathe_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('fimathe_levels', JSON.stringify(levels));
  }, [levels]);

  useEffect(() => {
    localStorage.setItem('fimathe_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('fimathe_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);
  
  const pnlHistory = trades
    .filter(t => t.pnl)
    .map(t => t.pnl as number);

  const currentBalance = config.initialBalance + pnlHistory.reduce((acc, pnl) => acc + pnl, 0);

  const updateConfig = (newConfig: Partial<Config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const addLevel = (level: Omit<Level, 'id'>) => {
    const newLevel: Level = {
      ...level,
      id: new Date().toISOString() + Math.random(),
      ...calculateLevelDerivedData(level, config)
    };
    setLevels(prev => [...prev, newLevel]);
  };
  
  const updateLevel = (updatedLevel: Level) => {
    const recalculatedLevel = {
        ...updatedLevel,
        ...calculateLevelDerivedData(updatedLevel, config)
    }
    setLevels(prev => prev.map(l => l.id === updatedLevel.id ? recalculatedLevel : l));
  };
  
  const deleteLevel = (levelId: string) => {
      setLevels(prev => prev.filter(l => l.id !== levelId));
  }

  const addTrade = useCallback((trade: Omit<Trade, 'id'>) => {
    const pairData = config.pairs.find(p => p.name === trade.pair);
    if (!pairData) return;
    const newTrade: Trade = { 
        ...trade, 
        id: new Date().toISOString() + Math.random(),
        ...calculateTradeMetrics(trade, pairData, currentBalance, config.riskPerTrade)
    };
    setTrades(prev => [...prev, newTrade]);
  }, [config.pairs, config.riskPerTrade, currentBalance]);

  const updateTrade = (updatedTrade: Trade) => {
    const pairData = config.pairs.find(p => p.name === updatedTrade.pair);
    if (!pairData) return;
    const recalculatedTrade = {
        ...updatedTrade,
        ...calculateTradeMetrics(updatedTrade, pairData, currentBalance, config.riskPerTrade)
    };
    // FIX: Changed 'l' to 't' to correctly reference the current item in the map function.
    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? recalculatedTrade : t));
  };
  
  const deleteTrade = (tradeId: string) => {
      setTrades(prev => prev.filter(t => t.id !== tradeId));
  }

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    setJournalEntries(prev => [...prev, { ...entry, id: new Date().toISOString() + Math.random() }]);
  };

  const updateJournalEntry = (updatedEntry: JournalEntry) => {
    setJournalEntries(prev => prev.map(j => (j.id === updatedEntry.id ? updatedEntry : j)));
  };

  const deleteJournalEntry = (entryId: string) => {
    setJournalEntries(prev => prev.filter(j => j.id !== entryId));
  };
  
  const value = {
    config,
    levels,
    trades,
    journalEntries,
    updateConfig,
    addLevel,
    updateLevel,
    deleteLevel,
    addTrade,
    updateTrade,
    deleteTrade,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    currentBalance,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};