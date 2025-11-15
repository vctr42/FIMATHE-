
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { JournalEntry } from '../types';
import { format } from 'date-fns';
import { Book, Edit, Trash2 } from 'lucide-react';

const emptyEntry: Omit<JournalEntry, 'id'> = {
  date: format(new Date(), 'yyyy-MM-dd'),
  bias: 'Neutro',
  confluences: '',
  plan: '',
  errors: '',
  learnings: '',
  discipline: 3,
};

export const DiarioPage: React.FC = () => {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useData();
  const [currentEntry, setCurrentEntry] = useState<Omit<JournalEntry, 'id'> | JournalEntry>(emptyEntry);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentEntry(prev => ({ ...prev, [name]: name === 'discipline' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ('id' in currentEntry) {
      updateJournalEntry(currentEntry);
    } else {
      addJournalEntry(currentEntry);
    }
    handleClear();
  };

  const handleClear = () => {
    setCurrentEntry(emptyEntry);
    setIsEditing(false);
  };

  const handleEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xl font-semibold mb-2">{isEditing ? 'Editar Entrada' : 'Nova Entrada no Diário'}</h3>
          <Input label="Data" name="date" type="date" value={currentEntry.date} onChange={handleChange} />
          <Select label="Viés do Dia" name="bias" value={currentEntry.bias} onChange={handleChange} options={['Compra', 'Venda', 'Neutro']} />
          <TextArea label="Confluências" name="confluences" value={currentEntry.confluences} onChange={handleChange} />
          <TextArea label="Plano de Ação" name="plan" value={currentEntry.plan} onChange={handleChange} />
          <TextArea label="Erros Cometidos" name="errors" value={currentEntry.errors} onChange={handleChange} />
          <TextArea label="Aprendizados" name="learnings" value={currentEntry.learnings} onChange={handleChange} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Nota de Disciplina: {currentEntry.discipline}</label>
            <input type="range" name="discipline" min="1" max="5" value={currentEntry.discipline} onChange={handleChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex space-x-2 pt-2">
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">{isEditing ? 'Salvar Alterações' : 'Adicionar Entrada'}</button>
            <button type="button" onClick={handleClear} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Limpar</button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {journalEntries.map(entry => (
          <div key={entry.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{format(new Date(entry.date), 'dd/MM/yyyy')}</p>
                <p className="text-sm text-gray-500">Viés: {entry.bias} | Disciplina: {'★'.repeat(entry.discipline)}{'☆'.repeat(5-entry.discipline)}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(entry)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"><Edit size={18} /></button>
                <button onClick={() => deleteJournalEntry(entry.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <JournalSection title="Confluências" content={entry.confluences} />
              <JournalSection title="Plano" content={entry.plan} />
              <JournalSection title="Erros" content={entry.errors} />
              <JournalSection title="Aprendizados" content={entry.learnings} />
            </div>
          </div>
        ))}
        {journalEntries.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                <Book className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma entrada no diário</h3>
                <p className="mt-1 text-sm text-gray-500">Comece adicionando uma nova entrada.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const JournalSection: React.FC<{title: string; content: string}> = ({title, content}) => (
    content ? <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-gray-600 whitespace-pre-wrap">{content}</p>
    </div> : null
)

const Input: React.FC<any> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
  </div>
);

const TextArea: React.FC<any> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea {...props} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
  </div>
);

const Select: React.FC<any> = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);
