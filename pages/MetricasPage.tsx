
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Trade, TradeStatus } from '../types';
import { Table, Td } from '../components/Table';
import { format } from 'date-fns';

export const MetricasPage: React.FC = () => {
  const { trades, config } = useData();
  const [filters, setFilters] = useState({ pair: 'all', tf: 'all', direction: 'all' });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredTrades = useMemo(() => {
    return trades
      .filter(t => t.status === TradeStatus.Fechada)
      .filter(t => filters.pair === 'all' || t.pair === filters.pair)
      .filter(t => filters.tf === 'all' || t.tf === filters.tf)
      .filter(t => filters.direction === 'all' || t.direction === filters.direction);
  }, [trades, filters]);
  
  const metrics = useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        totalTrades: 0, winRate: 0, avgWinR: 0, avgLossR: 0, payoff: 0, expectancy: 0, totalPnl: 0,
        maxDrawdown: 0, profitFactor: 0
      };
    }
    const wins = filteredTrades.filter(t => t.pnl! > 0);
    const losses = filteredTrades.filter(t => t.pnl! <= 0);
    const grossProfit = wins.reduce((acc, t) => acc + t.pnl!, 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl!, 0));

    const totalTrades = filteredTrades.length;
    const winRate = wins.length / totalTrades;
    const avgWinR = wins.reduce((acc, t) => acc + t.resultR!, 0) / (wins.length || 1);
    const avgLossR = Math.abs(losses.reduce((acc, t) => acc + t.resultR!, 0) / (losses.length || 1));
    const payoff = avgWinR / (avgLossR || 1);
    const expectancy = (winRate * avgWinR) - ((1 - winRate) * avgLossR);
    const totalPnl = filteredTrades.reduce((acc, t) => acc + t.pnl!, 0);
    const profitFactor = grossProfit / (grossLoss || 1);
    
    // Max Drawdown calculation
    let peak = config.initialBalance;
    let maxDd = 0;
    let cumulativePnl = config.initialBalance;
    filteredTrades.forEach(trade => {
        cumulativePnl += trade.pnl!;
        if (cumulativePnl > peak) {
            peak = cumulativePnl;
        }
        const drawdown = peak - cumulativePnl;
        if (drawdown > maxDd) {
            maxDd = drawdown;
        }
    });

    return { totalTrades, winRate, avgWinR, avgLossR, payoff, expectancy, totalPnl, maxDrawdown: maxDd, profitFactor };
  }, [filteredTrades, config.initialBalance]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectFilter label="Par" name="pair" value={filters.pair} onChange={handleFilterChange} options={['all', ...config.pairs.map(p => p.name)]} />
          <SelectFilter label="Timeframe" name="tf" value={filters.tf} onChange={handleFilterChange} options={['all', ...config.timeframes]} />
          <SelectFilter label="Direção" name="direction" value={filters.direction} onChange={handleFilterChange} options={['all', 'Buy', 'Sell']} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total de Trades" value={metrics.totalTrades} />
        <MetricCard title="Win Rate" value={`${(metrics.winRate * 100).toFixed(1)}%`} />
        <MetricCard title="Payoff Ratio" value={metrics.payoff.toFixed(2)} />
        <MetricCard title="Expectância (R)" value={metrics.expectancy.toFixed(2)} />
        <MetricCard title="Total PnL" value={`$${metrics.totalPnl.toFixed(2)}`} />
        <MetricCard title="Profit Factor" value={metrics.profitFactor.toFixed(2)} />
        <MetricCard title="Max Drawdown" value={`$${metrics.maxDrawdown.toFixed(2)}`} />
        <MetricCard title="Média R Ganho/Perda" value={`${metrics.avgWinR.toFixed(2)} / ${metrics.avgLossR.toFixed(2)}`} />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Histórico de Trades Filtrados</h3>
        <Table headers={['Data', 'Par', 'TF', 'Direção', 'Resultado (R)', 'PnL ($)']}>
          {filteredTrades.map(trade => (
            <tr key={trade.id} className="even:bg-gray-50">
              <Td>{format(new Date(trade.dateTime), 'dd/MM/yyyy HH:mm')}</Td>
              <Td>{trade.pair}</Td>
              <Td>{trade.tf}</Td>
              <Td className={trade.direction === 'Buy' ? 'text-green-600' : 'text-red-600'}>{trade.direction}</Td>
              <Td className={trade.resultR! > 0 ? 'text-green-600' : 'text-red-600'}>{trade.resultR!.toFixed(2)}</Td>
              <Td className={trade.pnl! > 0 ? 'text-green-600' : 'text-red-600'}>${trade.pnl!.toFixed(2)}</Td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
};

const SelectFilter: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({label, options, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select {...props} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            {options.map(opt => <option key={opt} value={opt}>{opt === 'all' ? 'Todos' : opt}</option>)}
        </select>
    </div>
);

const MetricCard: React.FC<{title: string, value: string | number}> = ({title, value}) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
)
