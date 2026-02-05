import React from 'react';
import { Edit2, Trash2, Check, Calendar } from 'lucide-react';
import { ScheduledBillInstance, Category } from '../types';
import { deleteScheduledBillInstance, deleteScheduledBillSeries, updateScheduledBillInstance } from '../utils/storage';

interface ScheduleListProps {
  instances: ScheduledBillInstance[];
  categories: Category[];
  onUpdate: () => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  instances,
  categories,
  onUpdate,
}) => {
  const sortedInstances = [...instances].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  const handleMarkAsPaid = (instance: ScheduledBillInstance) => {
    if (window.confirm('Marcar esta conta como paga?')) {
      deleteScheduledBillInstance(instance.id);
      onUpdate();
    }
  };

  const handleEdit = (instance: ScheduledBillInstance) => {
    const newDescription = window.prompt('Nova descrição:', instance.description);
    if (newDescription && newDescription !== instance.description) {
      updateScheduledBillInstance(instance.id, { description: newDescription });
      onUpdate();
    }
  };

  const handleDelete = (instance: ScheduledBillInstance) => {
    const deleteOption = window.prompt(
      'Digite:\n1 - Excluir apenas este\n2 - Excluir todos da série'
    );
    
    if (deleteOption === '1') {
      deleteScheduledBillInstance(instance.id);
      onUpdate();
    } else if (deleteOption === '2') {
      if (window.confirm('Confirma excluir toda a série de agendamentos?')) {
        deleteScheduledBillSeries(instance.seriesId);
        onUpdate();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Vencimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedInstances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma conta agendada para este mês
                </td>
              </tr>
            ) : (
              sortedInstances.map(instance => (
                <tr key={instance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(instance.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {instance.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {getCategoryName(instance.categoryId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600 dark:text-red-400">
                    R$ {instance.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      instance.status === 'paid'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {instance.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {instance.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(instance)}
                          className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                          title="Marcar como pago"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(instance)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(instance)}
                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
