import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Category, Transaction } from '../types';
import { addTransaction, updateTransaction, deleteTransaction, getUserTransactions } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

interface TransactionModalProps {
  onClose: () => void;
  onSave: () => void;
  categories: Category[];
  transaction?: Transaction;
  editMode?: 'single' | 'future' | 'all';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  onClose,
  onSave,
  categories,
  transaction,
  editMode,
}) => {
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || '');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false);
  const [recurringMonths, setRecurringMonths] = useState(transaction?.recurringMonths?.toString() || '1');
  const [showEditOptions, setShowEditOptions] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !description || !categoryId || !date) {
      alert('Preencha todos os campos');
      return;
    }

    if (transaction && transaction.isRecurring && !editMode) {
      setShowEditOptions(true);
      return;
    }

    const transactionData = {
      userId: user.id,
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
      date,
      isRecurring,
      recurringMonths: isRecurring ? parseInt(recurringMonths) : undefined,
      recurringSeriesId: transaction?.recurringSeriesId || (isRecurring ? `series-${Date.now()}` : undefined),
    };

    if (transaction) {
      if (editMode === 'single') {
        updateTransaction(transaction.id, transactionData);
      } else if (editMode === 'future' || editMode === 'all') {
        const allTransactions = getUserTransactions(user.id);
        const seriesToUpdate = allTransactions.filter((t: Transaction) => 
          t.recurringSeriesId === transaction.recurringSeriesId
        );

        seriesToUpdate.forEach((t: Transaction) => {
          const shouldUpdate = editMode === 'all' || new Date(t.date) >= new Date(transaction.date);
          if (shouldUpdate) {
            updateTransaction(t.id, transactionData);
          }
        });
      }
    } else {
      if (isRecurring) {
        const seriesId = `series-${Date.now()}`;
        const baseDate = new Date(date);
        
        for (let i = 0; i < parseInt(recurringMonths); i++) {
          const recurringDate = new Date(baseDate);
          recurringDate.setMonth(recurringDate.getMonth() + i);
          
          addTransaction({
            ...transactionData,
            date: recurringDate.toISOString().split('T')[0],
            recurringSeriesId: seriesId,
          });
        }
      } else {
        addTransaction(transactionData);
      }
    }

    onSave();
    onClose();
  };

  const handleDelete = () => {
    if (!transaction) return;
    
    if (window.confirm('Deseja excluir este lançamento?')) {
      if (transaction.isRecurring) {
        const deleteOption = window.prompt(
          'Digite:\n1 - Excluir apenas este\n2 - Excluir este e futuros\n3 - Excluir todos da série'
        );
        
        if (deleteOption === '1') {
          deleteTransaction(transaction.id);
        } else if (deleteOption === '2' || deleteOption === '3') {
          const allTransactions = getUserTransactions(user!.id);
          const seriesToDelete = allTransactions.filter((t: Transaction) => 
            t.recurringSeriesId === transaction.recurringSeriesId
          );

          seriesToDelete.forEach((t: Transaction) => {
            const shouldDelete = deleteOption === '3' || new Date(t.date) >= new Date(transaction.date);
            if (shouldDelete) {
              deleteTransaction(t.id);
            }
          });
        }
      } else {
        deleteTransaction(transaction.id);
      }
      
      onSave();
      onClose();
    }
  };

  const handleEditSingle = () => {
    if (!user || !transaction) return;
    updateTransaction(transaction.id, {
      type,
      amount: parseFloat(amount),
      description,
      categoryId,
    });
    onSave();
    onClose();
  };

  const handleEditFuture = () => {
    if (!user || !transaction) return;
    const allTransactions = getUserTransactions(user.id);
    const seriesToUpdate = allTransactions.filter((t: Transaction) => 
      t.recurringSeriesId === transaction.recurringSeriesId &&
      new Date(t.date) >= new Date(transaction.date)
    );
    seriesToUpdate.forEach((t: Transaction) => {
      updateTransaction(t.id, {
        type,
        amount: parseFloat(amount),
        description,
        categoryId,
      });
    });
    onSave();
    onClose();
  };

  const handleEditAll = () => {
    if (!user || !transaction) return;
    const allTransactions = getUserTransactions(user.id);
    const seriesToUpdate = allTransactions.filter((t: Transaction) => 
      t.recurringSeriesId === transaction.recurringSeriesId
    );
    seriesToUpdate.forEach((t: Transaction) => {
      updateTransaction(t.id, {
        type,
        amount: parseFloat(amount),
        description,
        categoryId,
      });
    });
    onSave();
    onClose();
  };

  if (showEditOptions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Editar Lançamento Recorrente
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Como deseja aplicar as alterações?
          </p>
          <div className="space-y-3">
            <button
              onClick={handleEditSingle}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Apenas este lançamento
            </button>
            <button
              onClick={handleEditFuture}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Este e os futuros
            </button>
            <button
              onClick={handleEditAll}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Todos da série
            </button>
            <button
              onClick={() => setShowEditOptions(false)}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {transaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  type === 'expense'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  type === 'income'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Receita
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Supermercado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecione uma categoria</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {!transaction && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lançamento recorrente
                </label>
              </div>

              {isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Repetir por quantos meses?
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={recurringMonths}
                    onChange={(e) => setRecurringMonths(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {transaction ? 'Salvar' : 'Adicionar'}
            </button>
            {transaction && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Excluir
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
