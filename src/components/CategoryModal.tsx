import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from '../types';
import { addCategory, updateCategory, deleteCategory } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

interface CategoryModalProps {
  onClose: () => void;
  onSave: () => void;
  categories: Category[];
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  onClose,
  onSave,
  categories,
}) => {
  const { user } = useAuth();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleAddCategory = () => {
    if (!user || !newCategoryName.trim()) {
      alert('Digite o nome da categoria');
      return;
    }

    addCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
      userId: user.id,
    });

    setNewCategoryName('');
    onSave();
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) {
      alert('Digite o nome da categoria');
      return;
    }

    updateCategory(editingCategory.id, { name: newCategoryName.trim() });
    setEditingCategory(null);
    setNewCategoryName('');
    onSave();
  };

  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(`Excluir a categoria "${category.name}"?`)) {
      deleteCategory(category.id);
      onSave();
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryType(category.type);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setNewCategoryName('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciar Categorias
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewCategoryType('expense')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    newCategoryType === 'expense'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setNewCategoryType('income')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    newCategoryType === 'income'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Receita
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da categoria"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      editingCategory ? handleUpdateCategory() : handleAddCategory();
                    }
                  }}
                />
                {editingCategory ? (
                  <>
                    <button
                      onClick={handleUpdateCategory}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
              Categorias de Despesas
            </h3>
            <div className="space-y-2">
              {expenseCategories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma categoria de despesa</p>
              ) : (
                expenseCategories.map(category => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    <span className="text-gray-900 dark:text-white font-medium">
                      {category.name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(category)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
              Categorias de Receitas
            </h3>
            <div className="space-y-2">
              {incomeCategories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma categoria de receita</p>
              ) : (
                incomeCategories.map(category => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    <span className="text-gray-900 dark:text-white font-medium">
                      {category.name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(category)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
