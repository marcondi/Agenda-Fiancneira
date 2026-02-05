import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, LogOut, Moon, Sun, Settings, Download, Upload, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserTransactions, getUserCategories, getUserScheduledBillInstances } from '../utils/storage';
import { Transaction, Category, ScheduledBillInstance } from '../types';
import { TransactionModal } from './TransactionModal';
import { TransactionList } from './TransactionList';
import { CategoryModal } from './CategoryModal';
import { ScheduleModal } from './ScheduleModal';
import { ScheduleList } from './ScheduleList';
import { ExpenseChart } from './ExpenseChart';
import { AITips } from './AITips';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scheduledInstances, setScheduledInstances] = useState<ScheduledBillInstance[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'transactions' | 'schedule'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    if (!user) return;
    setTransactions(getUserTransactions(user.id));
    setCategories(getUserCategories(user.id));
    setScheduledInstances(getUserScheduledBillInstances(user.id));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const monthYear = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const currentMonthTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate.getMonth() === currentDate.getMonth() &&
           transDate.getFullYear() === currentDate.getFullYear();
  });

  const filteredTransactions = searchTerm
    ? currentMonthTransactions.filter(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               category?.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : currentMonthTransactions;

  const income = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const currentMonthScheduled = scheduledInstances.filter(s => {
    const dueDate = new Date(s.dueDate);
    return dueDate.getMonth() === currentDate.getMonth() &&
           dueDate.getFullYear() === currentDate.getFullYear();
  });

  const upcomingBills = scheduledInstances.filter(s => {
    const dueDate = new Date(s.dueDate);
    const today = new Date();
    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(today.getDate() + 5);
    return s.status === 'pending' && dueDate >= today && dueDate <= fiveDaysLater;
  });

  const handleExportData = () => {
    if (!user) return;
    const { exportData } = require('../utils/storage');
    const data = exportData(user.id);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && user) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const { importData } = require('../utils/storage');
            importData(user.id, event.target?.result as string);
            loadData();
            alert('Dados importados com sucesso!');
          } catch (error) {
            alert('Erro ao importar dados. Verifique o arquivo.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
                <h1 className="text-xl font-bold text-white">Finanças</h1>
              </div>
              <span className="text-gray-600 dark:text-gray-300">
                Olá, {user?.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Alternar tema"
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <button
                onClick={handleExportData}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Exportar dados"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={handleImportData}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Importar dados"
              >
                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Gerenciar categorias"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {upcomingBills.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">
                {upcomingBills.length} conta(s) vencem nos próximos 5 dias
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {monthYear}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('transactions')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'transactions'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Lançamentos
            </button>
            <button
              onClick={() => setActiveView('schedule')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'schedule'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Agenda
            </button>
          </div>
        </div>

        {activeView === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <button
                onClick={() => setActiveView('transactions')}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Entradas</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  R$ {income.toFixed(2)}
                </p>
              </button>

              <button
                onClick={() => setActiveView('transactions')}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Saídas</span>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  R$ {expenses.toFixed(2)}
                </p>
              </button>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Saldo</span>
                  <DollarSign className="w-5 h-5 text-indigo-500" />
                </div>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                  R$ {balance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ExpenseChart transactions={currentMonthTransactions} categories={categories} />
              <AITips transactions={currentMonthTransactions} categories={categories} />
            </div>

            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-2xl transition-colors flex items-center gap-2 z-50"
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold pr-2">Adicionar Lançamento</span>
            </button>
          </>
        )}

        {activeView === 'transactions' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <TransactionList
              transactions={filteredTransactions}
              categories={categories}
              onUpdate={loadData}
            />
            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-2xl transition-colors flex items-center gap-2 z-50"
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold pr-2">Adicionar Lançamento</span>
            </button>
          </div>
        )}

        {activeView === 'schedule' && (
          <div>
            <ScheduleList
              instances={currentMonthScheduled}
              categories={categories}
              onUpdate={loadData}
            />
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-2xl transition-colors flex items-center gap-2 z-50"
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold pr-2">Agendar Conta</span>
            </button>
          </div>
        )}
      </div>

      {isTransactionModalOpen && (
        <TransactionModal
          onClose={() => setIsTransactionModalOpen(false)}
          onSave={loadData}
          categories={categories}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={loadData}
          categories={categories}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleModal
          onClose={() => setIsScheduleModalOpen(false)}
          onSave={loadData}
          categories={categories.filter(c => c.type === 'expense')}
        />
      )}
    </div>
  );
};
