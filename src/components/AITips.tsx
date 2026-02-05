import React, { useState } from 'react';
import { Lightbulb, Loader } from 'lucide-react';
import { Transaction, Category } from '../types';

interface AITipsProps {
  transactions: Transaction[];
  categories: Category[];
}

export const AITips: React.FC<AITipsProps> = ({ transactions, categories }) => {
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTips = async () => {
    setLoading(true);
    setError('');
    
    const expenses = transactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
      setTips([
        'Comece registrando suas despesas para receber dicas personalizadas.',
        'Organize suas finanças criando categorias específicas.',
        'Defina metas mensais de economia.',
      ]);
      setLoading(false);
      return;
    }

    const categoryTotals = expenses.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = { total: 0, count: 0, name: '' };
      }
      const category = categories.find(c => c.id === categoryId);
      acc[categoryId].name = category?.name || 'Sem categoria';
      acc[categoryId].total += transaction.amount;
      acc[categoryId].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number; name: string }>);

    const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.total - a.total);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    try {
      const API_KEY = 'AIzaSyDOXUJd-lnM_H2QwRJ9F16oX0K7bHmS5nU';
      
      const prompt = `Analise estes dados financeiros de um mês e forneça exatamente 3 dicas curtas e práticas de economia em português:

Total gasto: R$ ${totalExpenses.toFixed(2)}
Principais categorias de despesa:
${sortedCategories.slice(0, 5).map(c => `- ${c.name}: R$ ${c.total.toFixed(2)} (${c.count} transações)`).join('\n')}

Responda APENAS com 3 linhas, uma dica por linha, sem numeração, sem introdução.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar dicas');
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const tipsArray = text.split('\n').filter((tip: string) => tip.trim()).slice(0, 3);
      
      setTips(tipsArray);
    } catch (err) {
      const topCategory = sortedCategories[0];
      const percentage = ((topCategory.total / totalExpenses) * 100).toFixed(0);
      
      setTips([
        `Sua maior despesa é em ${topCategory.name} (${percentage}% do total). Considere revisar esses gastos.`,
        `Você teve ${expenses.length} transações este mês. Tente consolidar compras para economizar.`,
        `Defina um limite mensal para cada categoria e acompanhe seu progresso.`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Dicas Financeiras
        </h3>
        <button
          onClick={generateTips}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Gerando...
            </>
          ) : (
            'Gerar Dicas'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {tips.length > 0 ? (
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {tip}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Clique em "Gerar Dicas" para receber sugestões personalizadas de economia
        </div>
      )}
    </div>
  );
};
