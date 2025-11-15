
import { Level, Config, Trade, PairData, TradeDirection, TradeStatus } from '../types';

export const calculateLevelDerivedData = (level: Pick<Level, 'high' | 'low' | 'pair' | 'tf' | 'date'>, config: Config) => {
  if (!level.high || !level.low || level.high <= level.low) {
    return {};
  }
  
  const high = Number(level.high);
  const low = Number(level.low);

  const mid = (high + low) / 2;
  const range = high - low;
  const chave = `${level.pair}${level.tf}${level.date}`;
  const nivelA = low + config.alpha * range;
  const nivelB = low + config.beta * range;
  const invalidator = low - config.gamma * range;
  const alvo1 = mid + 1 * range;
  const alvo2 = mid + 1.5 * range;
  const validade = `${level.date} 23:59`;

  return { mid, range, chave, nivelA, nivelB, invalidator, alvo1, alvo2, validade };
};

export const calculateTradeMetrics = (trade: Partial<Trade>, pairData: PairData, currentBalance: number, riskPerTrade: number) => {
  if (!trade.entry || !trade.stop || !pairData) {
    return {};
  }
  
  const entry = Number(trade.entry);
  const stop = Number(trade.stop);
  const exitPrice = Number(trade.exitPrice);

  const riskInPips = Math.abs(entry - stop);
  const rPips = (riskInPips / pairData.pipSize) - (pairData.spread + pairData.slippage);
  
  if (rPips <= 0) return { rPips: 0 };

  const riskValue = currentBalance * riskPerTrade;
  const lotSize = riskValue / (rPips * pairData.pipValuePerLot);

  let resultR: number | undefined;
  let pnl: number | undefined;

  if (trade.status === TradeStatus.Fechada && exitPrice) {
    const pipsWonOrLost = trade.direction === TradeDirection.Buy ? (exitPrice - entry) : (entry - exitPrice);
    const pnlInPips = (pipsWonOrLost / pairData.pipSize) - (pairData.spread + pairData.slippage);
    
    resultR = pnlInPips / rPips;
    pnl = resultR * riskValue;
  }
  
  return { rPips, lotSize, resultR, pnl };
};
