
import React from 'react';
import { useData } from '../contexts/DataContext';
import { PairData } from '../types';

export const ConfigPage: React.FC = () => {
  const { config, updateConfig, currentBalance } = useData();

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ [e.target.name]: parseFloat(e.target.value) });
  };

  const handlePairChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newPairs = [...config.pairs];
    const field = e.target.name as keyof PairData;
    const value = field === 'name' ? e.target.value : parseFloat(e.target.value);
    (newPairs[index] as any)[field] = value;
    updateConfig({ pairs: newPairs });
  };

  const addPair = () => {
    const newPair: PairData = { id: Date.now().toString(), name: '', pipSize: 0, pipValuePerLot: 0, spread: 0, slippage: 0 };
    updateConfig({ pairs: [...config.pairs, newPair] });
  };

  const removePair = (index: number) => {
    const newPairs = config.pairs.filter((_, i) => i !== index);
    updateConfig({ pairs: newPairs });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-6">Configurações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Banca Inicial" name="initialBalance" value={config.initialBalance} onChange={handleConfigChange} type="number" step="100" />
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">Banca Atual</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">${currentBalance.toFixed(2)}</p>
          </div>
          <InputGroup label="Risco por Trade (%)" name="riskPerTrade" value={config.riskPerTrade * 100} onChange={e => updateConfig({ riskPerTrade: parseFloat(e.target.value) / 100 })} type="number" step="0.1" />
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-6">Constantes FIMATHE</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup label="Alpha" name="alpha" value={config.alpha} onChange={handleConfigChange} type="number" step="0.001" />
          <InputGroup label="Beta" name="beta" value={config.beta} onChange={handleConfigChange} type="number" step="0.001" />
          <InputGroup label="Gamma" name="gamma" value={config.gamma} onChange={handleConfigChange} type="number" step="0.01" />
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-6">Tabela de Pares</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left text-sm font-semibold text-gray-600">Par</th>
                <th className="py-2 text-left text-sm font-semibold text-gray-600">Pip Size</th>
                <th className="py-2 text-left text-sm font-semibold text-gray-600">Pip Value/Lote</th>
                <th className="py-2 text-left text-sm font-semibold text-gray-600">Spread</th>
                <th className="py-2 text-left text-sm font-semibold text-gray-600">Slippage</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {config.pairs.map((pair, index) => (
                <tr key={pair.id} className="border-b">
                  <td><input type="text" name="name" value={pair.name} onChange={(e) => handlePairChange(index, e)} className="mt-1 w-full p-2 border rounded-md" /></td>
                  <td><input type="number" name="pipSize" value={pair.pipSize} onChange={(e) => handlePairChange(index, e)} className="mt-1 w-full p-2 border rounded-md" step="0.00001" /></td>
                  <td><input type="number" name="pipValuePerLot" value={pair.pipValuePerLot} onChange={(e) => handlePairChange(index, e)} className="mt-1 w-full p-2 border rounded-md" /></td>
                  <td><input type="number" name="spread" value={pair.spread} onChange={(e) => handlePairChange(index, e)} className="mt-1 w-full p-2 border rounded-md" step="0.00001" /></td>
                  <td><input type="number" name="slippage" value={pair.slippage} onChange={(e) => handlePairChange(index, e)} className="mt-1 w-full p-2 border rounded-md" step="0.00001" /></td>
                  <td><button onClick={() => removePair(index)} className="text-red-500 hover:text-red-700 p-2">&times;</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addPair} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Adicionar Par</button>
      </div>
    </div>
  );
};

interface InputGroupProps {
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  step?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, name, value, onChange, type = 'text', step }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      step={step}
      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
);
