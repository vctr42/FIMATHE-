
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Level } from '../types';
import { Table, Td } from '../components/Table';
import { PlusCircle, Trash2 } from 'lucide-react';

const emptyLevel: Omit<Level, 'id'> = { pair: '', tf: '', date: '', high: 0, low: 0 };

export const NiveisPage: React.FC = () => {
  const { levels, config, addLevel, updateLevel, deleteLevel } = useData();
  const [newLevel, setNewLevel] = useState(emptyLevel);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLevel(prev => ({ ...prev, [name]: name === 'high' || name === 'low' ? parseFloat(value) : value }));
  };

  const handleAddLevel = () => {
    if (newLevel.pair && newLevel.tf && newLevel.date && newLevel.high > newLevel.low) {
      addLevel(newLevel);
      setNewLevel(emptyLevel);
    } else {
      alert('Preencha todos os campos corretamente. High deve ser maior que Low.');
    }
  };
  
  const handleUpdate = (level: Level, field: keyof Level, value: any) => {
    updateLevel({ ...level, [field]: Number(value) });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Adicionar Novo Nível</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <SelectInput label="Par" name="pair" value={newLevel.pair} onChange={handleInputChange} options={config.pairs.map(p => p.name)} />
            <SelectInput label="TF" name="tf" value={newLevel.tf} onChange={handleInputChange} options={config.timeframes} />
            <Input label="Data" type="date" name="date" value={newLevel.date} onChange={handleInputChange} />
            <Input label="High" type="number" name="high" value={newLevel.high} onChange={handleInputChange} />
            <Input label="Low" type="number" name="low" value={newLevel.low} onChange={handleInputChange} />
            <button onClick={handleAddLevel} className="h-10 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                <PlusCircle className="w-5 h-5 mr-2" /> Adicionar
            </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Níveis Calculados</h3>
        <Table headers={['Par', 'TF', 'Data', 'High', 'Low', 'Nivel A', 'Nivel B', 'Invalidador', 'Alvo 1', 'Alvo 2', 'Ações']}>
            {levels.map(level => (
                <tr key={level.id} className="even:bg-gray-50">
                    <Td>{level.pair}</Td>
                    <Td>{level.tf}</Td>
                    <Td>{level.date}</Td>
                    <Td><input type="number" value={level.high} onChange={(e) => handleUpdate(level, 'high', e.target.value)} className="w-24 p-1 border rounded-md bg-transparent"/></Td>
                    <Td><input type="number" value={level.low} onChange={(e) => handleUpdate(level, 'low', e.target.value)} className="w-24 p-1 border rounded-md bg-transparent"/></Td>
                    <Td>{level.nivelA?.toFixed(4)}</Td>
                    <Td>{level.nivelB?.toFixed(4)}</Td>
                    <Td>{level.invalidator?.toFixed(4)}</Td>
                    <Td>{level.alvo1?.toFixed(4)}</Td>
                    <Td>{level.alvo2?.toFixed(4)}</Td>
                    <Td>
                        <button onClick={() => deleteLevel(level.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                        </button>
                    </Td>
                </tr>
            ))}
        </Table>
      </div>
    </div>
  );
};

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
