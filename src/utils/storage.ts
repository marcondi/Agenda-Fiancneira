import { AppData, User, Category, Transaction, ScheduledBill, ScheduledBillInstance } from '../types';

const STORAGE_KEY = 'finance-app-data';

const defaultCategories: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Salário', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Investimentos', type: 'income' },
  { name: 'Outros Recebimentos', type: 'income' },
  { name: 'Alimentação', type: 'expense' },
  { name: 'Transporte', type: 'expense' },
  { name: 'Moradia', type: 'expense' },
  { name: 'Saúde', type: 'expense' },
  { name: 'Educação', type: 'expense' },
  { name: 'Lazer', type: 'expense' },
  { name: 'Vestuário', type: 'expense' },
  { name: 'Contas', type: 'expense' },
  { name: 'Outros Gastos', type: 'expense' },
];

const getDefaultData = (): AppData => ({
  users: [],
  categories: [],
  transactions: [],
  scheduledBills: [],
  scheduledBillInstances: [],
});

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return getDefaultData();
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const createUser = (name: string, email: string, password: string): User => {
  const data = loadData();
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random()}`,
    name,
    email,
    password,
  };
  data.users.push(newUser);
  
  defaultCategories.forEach((cat) => {
    data.categories.push({
      id: `cat-${Date.now()}-${Math.random()}`,
      ...cat,
      userId: newUser.id,
    });
  });
  
  saveData(data);
  return newUser;
};

export const createGuestUser = (): User => {
  const data = loadData();
  const guestUser: User = {
    id: `guest-${Date.now()}-${Math.random()}`,
    name: 'Convidado',
    email: '',
    password: '',
  };
  data.users.push(guestUser);
  
  defaultCategories.forEach((cat) => {
    data.categories.push({
      id: `cat-${Date.now()}-${Math.random()}`,
      ...cat,
      userId: guestUser.id,
    });
  });
  
  saveData(data);
  return guestUser;
};

export const authenticateUser = (email: string, password: string): User | null => {
  const data = loadData();
  const user = data.users.find(u => u.email === email && u.password === password);
  return user || null;
};

export const getUserCategories = (userId: string): Category[] => {
  const data = loadData();
  return data.categories.filter(c => c.userId === userId);
};

export const getUserTransactions = (userId: string): Transaction[] => {
  const data = loadData();
  return data.transactions.filter(t => t.userId === userId);
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const data = loadData();
  const newTransaction: Transaction = {
    ...transaction,
    id: `trans-${Date.now()}-${Math.random()}`,
  };
  data.transactions.push(newTransaction);
  saveData(data);
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): void => {
  const data = loadData();
  const index = data.transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    data.transactions[index] = { ...data.transactions[index], ...updates };
    saveData(data);
  }
};

export const deleteTransaction = (id: string): void => {
  const data = loadData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
};

export const addCategory = (category: Omit<Category, 'id'>): Category => {
  const data = loadData();
  const newCategory: Category = {
    ...category,
    id: `cat-${Date.now()}-${Math.random()}`,
  };
  data.categories.push(newCategory);
  saveData(data);
  return newCategory;
};

export const updateCategory = (id: string, updates: Partial<Category>): void => {
  const data = loadData();
  const index = data.categories.findIndex(c => c.id === id);
  if (index !== -1) {
    data.categories[index] = { ...data.categories[index], ...updates };
    saveData(data);
  }
};

export const deleteCategory = (id: string): void => {
  const data = loadData();
  data.categories = data.categories.filter(c => c.id !== id);
  saveData(data);
};

export const addScheduledBill = (bill: Omit<ScheduledBill, 'id' | 'seriesId'>): ScheduledBill => {
  const data = loadData();
  const seriesId = `series-${Date.now()}-${Math.random()}`;
  const newBill: ScheduledBill = {
    ...bill,
    id: `bill-${Date.now()}-${Math.random()}`,
    seriesId,
  };
  data.scheduledBills.push(newBill);
  
  const startDate = new Date(bill.startDate);
  for (let i = 0; i < bill.recurringMonths; i++) {
    const instanceDate = new Date(startDate);
    instanceDate.setMonth(instanceDate.getMonth() + i);
    instanceDate.setDate(bill.dueDay);
    
    const instance: ScheduledBillInstance = {
      id: `bill-inst-${Date.now()}-${Math.random()}-${i}`,
      billId: newBill.id,
      userId: bill.userId,
      description: bill.description,
      amount: bill.amount,
      categoryId: bill.categoryId,
      dueDate: instanceDate.toISOString().split('T')[0],
      status: 'pending',
      seriesId,
    };
    data.scheduledBillInstances.push(instance);
  }
  
  saveData(data);
  return newBill;
};

export const getUserScheduledBillInstances = (userId: string): ScheduledBillInstance[] => {
  const data = loadData();
  return data.scheduledBillInstances.filter(i => i.userId === userId);
};

export const updateScheduledBillInstance = (id: string, updates: Partial<ScheduledBillInstance>): void => {
  const data = loadData();
  const index = data.scheduledBillInstances.findIndex(i => i.id === id);
  if (index !== -1) {
    data.scheduledBillInstances[index] = { ...data.scheduledBillInstances[index], ...updates };
    saveData(data);
  }
};

export const deleteScheduledBillInstance = (id: string): void => {
  const data = loadData();
  data.scheduledBillInstances = data.scheduledBillInstances.filter(i => i.id !== id);
  saveData(data);
};

export const deleteScheduledBillSeries = (seriesId: string): void => {
  const data = loadData();
  data.scheduledBills = data.scheduledBills.filter(b => b.seriesId !== seriesId);
  data.scheduledBillInstances = data.scheduledBillInstances.filter(i => i.seriesId !== seriesId);
  saveData(data);
};

export const exportData = (userId: string): string => {
  const data = loadData();
  const userData = {
    categories: data.categories.filter(c => c.userId === userId),
    transactions: data.transactions.filter(t => t.userId === userId),
    scheduledBills: data.scheduledBills.filter(b => b.userId === userId),
    scheduledBillInstances: data.scheduledBillInstances.filter(i => i.userId === userId),
  };
  return JSON.stringify(userData, null, 2);
};

export const importData = (userId: string, importedData: string): void => {
  try {
    const parsed = JSON.parse(importedData);
    const data = loadData();
    
    if (parsed.categories) {
      parsed.categories.forEach((cat: Category) => {
        data.categories.push({ ...cat, userId, id: `cat-${Date.now()}-${Math.random()}` });
      });
    }
    if (parsed.transactions) {
      parsed.transactions.forEach((trans: Transaction) => {
        data.transactions.push({ ...trans, userId, id: `trans-${Date.now()}-${Math.random()}` });
      });
    }
    if (parsed.scheduledBills) {
      parsed.scheduledBills.forEach((bill: ScheduledBill) => {
        data.scheduledBills.push({ ...bill, userId, id: `bill-${Date.now()}-${Math.random()}` });
      });
    }
    if (parsed.scheduledBillInstances) {
      parsed.scheduledBillInstances.forEach((inst: ScheduledBillInstance) => {
        data.scheduledBillInstances.push({ ...inst, userId, id: `bill-inst-${Date.now()}-${Math.random()}` });
      });
    }
    
    saveData(data);
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};
