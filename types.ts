
export interface PairData {
  id: string;
  name: string;
  pipSize: number;
  pipValuePerLot: number;
  spread: number;
  slippage: number;
}

export interface Config {
  initialBalance: number;
  riskPerTrade: number;
  alpha: number;
  beta: number;
  gamma: number;
  pairs: PairData[];
  timeframes: string[];
}

export interface Level {
  id: string;
  pair: string;
  tf: string;
  date: string; // YYYY-MM-DD
  high: number;
  low: number;
  mid?: number;
  range?: number;
  chave?: string;
  nivelA?: number;
  nivelB?: number;
  invalidator?: number;
  alvo1?: number;
  alvo2?: number;
  validade?: string;
}

export enum TradeDirection {
  Buy = 'Buy',
  Sell = 'Sell',
}

export enum TradeStatus {
  Aberta = 'Aberta',
  Fechada = 'Fechada',
  Cancelada = 'Cancelada',
}

export interface Trade {
  id: string;
  dateTime: string;
  pair: string;
  tf: string;
  direction: TradeDirection;
  entry: number;
  stop: number;
  alvo1: number;
  alvo2: number;
  rPips?: number;
  lotSize?: number;
  resultR?: number;
  pnl?: number;
  status: TradeStatus;
  exitPrice?: number;
  exitDateTime?: string;
  observations?: string;
  chave: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  bias: 'Compra' | 'Venda' | 'Neutro';
  confluences: string;
  plan: string;
  errors: string;
  learnings: string;
  discipline: number; // 1-5
}
