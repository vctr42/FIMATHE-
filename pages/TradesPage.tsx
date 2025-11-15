
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Trade, TradeDirection, TradeStatus } from '../types';
import { Table, Td } from '../components/Table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const emptyTrade: Omit<Trade, 'id' | 'chave'> & { date: string } = {
  dateTime: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  pair: '',
  tf: '',
  direction: TradeDirection.Buy,
  entry: 0,
  stop: 0,
  alvo1: 0,
  alvo2: 0,
  status: TradeStatus.Aberta,
};

export const TradesPage: React.FC = () => {
  const { trades, config, levels, addTrade, updateTrade, deleteTrade } = useData();
  const [newTrade, setNewTrade] = useState(emptyTrade);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  useEffect(() => {
    if (newTrade.pair && newTrade.tf && newTrade.date) {
      const chave = `${newTrade.pair}${newTrade.tf}${newTrade.date}`;
      const level = levels.find(l => l.chave === chave);
      if (level) {
        setNewTrade(prev => ({
          ...prev,
          entry: level.nivelA || 0, // Default to NivelA
          stop: level.invalidator || 0,
          alvo1: level.alvo1 || 0,
          alvo2: level.alvo2 || 0,
        }));
      }
    }
  }, [newTrade.pair, newTrade.tf, newTrade.date, levels]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['entry', 'stop', 'alvo1', 'alvo2'].includes(name);
    setNewTrade(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) : value }));
  };

  const handleAddTrade = () => {
    if (newTrade.pair && newTrade.tf && newTrade.date && newTrade.entry > 0) {
      const chave = `${newTrade.pair}${newTrade.tf}${newTrade.date}`;
      addTrade({ ...newTrade, chave, dateTime: new Date().toISOString() });
      setNewTrade(emptyTrade);
    } else {
      alert('Preencha os campos obrigatórios.');
    }
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if(editingTrade) {
      const { name, value } = e.target;
      const isNumeric = ['entry', 'stop', 'alvo1', 'alvo2', 'exitPrice'].includes(name);
      setEditingTrade(prev => prev ? ({ ...prev, [name]: isNumeric ? parseFloat(value) : value }) : null);
    }
  };

  const handleSave = () => {
    if (editingTrade) {
      updateTrade(editingTrade);
      setIsEditing(null);
      setEditingTrade(null);
    }
  };

  const startEditing = (trade: Trade) => {
    setIsEditing(trade.id);
    setEditingTrade(trade);
  }

  const renderCell = (trade: Trade, field: keyof Trade, type: string = "text") => {
    if (isEditing === trade.id && editingTrade) {
        const value = editingTrade[field] || '';
        if (field === 'direction' || field === 'status') {
            const options = field === 'direction' ? Object.values(TradeDirection) : Object.values(TradeStatus);
            return (
                <select name={field} value={value as string} onChange={handleEditChange} className="p-1 border rounded-md bg-transparent">
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        }
      return <input type={type} name={field as string} value={value as any} onChange={handleEditChange} className="w-24 p-1 border rounded-md bg-transparent"/>;
    }
    const value = trade[field];
    if (typeof value === 'number') {
        return value.toFixed(5);
    }
    if (field === 'dateTime') return format(new Date(value as string), 'dd/MM/yy HH:mm');
    return value as string;
  };

  const formatNumber = (num?: number) => num?.toFixed(2) || 'N/A';
  const rColor = (r?: number) => (r || 0) > 0 ? 'text-green-600' : (r || 0) < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Lançar Trade</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 items-end">
            <SelectInput label="Par" name="pair" value={newTrade.pair} onChange={handleInputChange} options={config.pairs.map(p => p.name)} />
            <SelectInput label="TF" name="tf" value={newTrade.tf} onChange={handleInputChange} options={config.timeframes} />
            <Input label="Data Nível" type="date" name="date" value={newTrade.date} onChange={handleInputChange} />
            <SelectInput label="Direção" name="direction" value={newTrade.direction} onChange={handleInputChange} options={Object.values(TradeDirection)} />
            <Input label="Entrada" type="number" name="entry" value={newTrade.entry} onChange={handleInputChange} />
            <Input label="Stop" type="number" name="stop" value={newTrade.stop} onChange={handleInputChange} />
            <Input label="Alvo 1" type="number" name="alvo1" value={newTrade.alvo1} onChange={handleInputChange} />
            <button onClick={handleAddTrade} className="h-10 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                <PlusCircle className="w-5 h-5 mr-2" /> Lançar
            </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Trades Registrados</h3>
        <Table headers={['Data/Hora', 'Par', 'TF', 'Direção', 'Entrada', 'Stop', 'Saída', 'Status', 'Lotes', 'Resultado (R)', 'PnL ($)', 'Ações']}>
            {trades.map(trade => (
                <tr key={trade.id} className="even:bg-gray-50">
                    <Td>{renderCell(trade, 'dateTime')}</Td>
                    <Td>{trade.pair}</Td>
                    <Td>{trade.tf}</Td>
                    <Td><span className={trade.direction === TradeDirection.Buy ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{renderCell(trade, 'direction')}</span></Td>
                    <Td>{renderCell(trade, 'entry', 'number')}</Td>
                    <Td>{renderCell(trade, 'stop', 'number')}</Td>
                    <Td>{renderCell(trade, 'exitPrice', 'number')}</Td>
                    <Td>{renderCell(trade, 'status')}</Td>
                    <Td>{formatNumber(trade.lotSize)}</Td>
                    <Td className={rColor(trade.resultR)}>{formatNumber(trade.resultR)}</Td>
                    <Td className={rColor(trade.pnl)}>{formatNumber(trade.pnl)}</Td>
                    <Td>
                        <div className="flex items-center space-x-2">
                           {isEditing === trade.id ? (
                             <button onClick={handleSave} className="text-blue-500">Salvar</button>
                           ) : (
                             <button onClick={() => startEditing(trade)} className="text-blue-500">Editar</button>
                           )}
                           <button onClick={() => deleteTrade(trade.id)} className="text-red-500"><Trash2 size={16} /></button>
                        </div>
                    </Td>
                </tr>
            ))}
        </Table>
      </div>
    </div>
  );
};

// Reusable input components
const Input: React.FC<{label: string, name: string, type: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({label, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
    </div>
);

const SelectInput: React.FC<{label: string, name: string, value: any, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({label, options, ...props}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="">Selecione</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
