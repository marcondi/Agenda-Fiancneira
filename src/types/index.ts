export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  userId: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  isRecurring?: boolean;
  recurringMonths?: number;
  recurringSeriesId?: string;
}

export interface ScheduledBill {
  id: string;
  userId: string;
  description: string;
  amount: number;
  categoryId: string;
  dueDay: number;
  recurringMonths: number;
  startDate: string;
  seriesId: string;
}

export interface ScheduledBillInstance {
  id: string;
  billId: string;
  userId: string;
  description: string;
  amount: number;
  categoryId: string;
  dueDate: string;
  status: 'pending' | 'paid';
  seriesId: string;
}

export interface AppData {
  users: User[];
  categories: Category[];
  transactions: Transaction[];
  scheduledBills: ScheduledBill[];
  scheduledBillInstances: ScheduledBillInstance[];
}
