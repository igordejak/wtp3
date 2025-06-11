// src/database/models/MoneyTransaction.ts

export interface MoneyTransaction {
  id?: number; // Автоматично генерується Dexie, тому необов'язковий для нових записів
  amount: number;
  type: 'lend' | 'borrow'; // 'lend' або 'borrow'
  date: number; // Дата транзакції, зберігається як Unix timestamp (число)
  description?: string | null; // Опис транзакції (опціонально), додано null для узгодженості
  stuffItemId: number; // ID пов'язаної речі/людини, тепер це число (як ID в Dexie)
  returnDate?: number | null; // Опціональна дата повернення, зберігається як Unix timestamp (число)
  currency: string;
}