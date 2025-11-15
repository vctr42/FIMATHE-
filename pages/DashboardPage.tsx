import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, Percent, Target, TrendingUp, TrendingDown, ListChecks } from 'lucide-react';
import { Trade, TradeStatus } from '../types';

export const DashboardPage: React.FC = () => {
  const { trades, config } = useData();

  const metrics = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === TradeStatus.Fechada && t.pnl !== undefined && t.resultR !== undefined);
    if (closedTrades.length === 0) {
      return {
        winRate: 0,
        payoff: 0,
        expectancy: 0,
        totalPnl: 0,
        totalTrades: 0,
        equityData: [{ trade: 0, pnl: config.initialBalance }],
        rDistribution: []
      };
    }

    const wins = closedTrades.filter(t => t.pnl! > 0);
    const losses = closedTrades.filter(t => t.pnl! <= 0);

    const winRate = wins.length / closedTrades.length;
    const avgWinR = wins.reduce((acc, t) => acc + t.resultR!, 0) / (wins.length || 1);
    const avgLossR = Math.abs(losses.reduce((acc, t) => acc + t.resultR!, 0) / (losses.length || 1));
    const payoff = avgWinR / (avgLossR || 1);
    const expectancy = (winRate * avgWinR) - ((1 - winRate) * avgLossR);
    const totalPnl = closedTrades.reduce((acc, t) => acc + t.pnl!, 0);

    let cumulativePnl = config.initialBalance;
    const equityData = [{ trade: 0, equity: config.initialBalance, pnl: 0 }];
    closedTrades.forEach((trade, index) => {
      cumulativePnl += trade.pnl!;
      equityData.push({ trade: index + 1, equity: cumulativePnl, pnl: trade.pnl! });
    });

    const rDistribution = closedTrades.reduce((acc, trade) => {
        const rRounded = Math.round(trade.resultR!);
        acc[rRounded] = (acc[rRounded] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const rDistributionData = Object.entries(rDistribution)
        .map(([r, count]) => ({ r: Number(r), count }))
        .sort((a,b) => a.r - b.r);


    return {
      winRate,
      payoff,
      expectancy,
      totalPnl,
      totalTrades: closedTrades.length,
      equityData,
      rDistribution: rDistributionData
    };
  }, [trades, config.initialBalance]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card title="PnL Acumulado" value={`$${metrics.totalPnl.toFixed(2)}`} icon={<DollarSign />} color={metrics.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'} />
        <Card title="Win Rate" value={`${(metrics.winRate * 100).toFixed(1)}%`} icon={<Percent />} />
        <Card title="Payoff Ratio" value={metrics.payoff.toFixed(2)} icon={<Target />} />
        <Card title="Expectância (R)" value={metrics.expectancy.toFixed(2)} icon={<TrendingUp />} color={metrics.expectancy >= 0 ? 'text-green-600' : 'text-red-600'}/>
        <Card title="Nº de Trades" value={metrics.totalTrades} icon={<ListChecks />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Curva de Equity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="trade" name="Trade" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Patrimônio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de R</h3>
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.rDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="r" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Trades">
                    {metrics.rDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.r >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                </Bar>
            </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
