// src/database/models/index.ts
// Тепер це просто TypeScript інтерфейси для ваших даних

export interface MoneyTransaction {
  id?: number; // 'id' є необов'язковим, оскільки Dexie генерує його автоматично
  amount: number;
  type: 'lend' | 'borrow';
  date: number; // Зберігаємо як timestamp (число)
  description?: string | null;
  stuffItemId: number; // Змінено на number, оскільки Dexie ID це number
  returnDate?: number | null; // Зберігаємо як timestamp (число)
}

export interface StuffItem {
  id?: number; // 'id' є необов'язковим
  name: string;
  contactInfo?: string | null;
  isPerson: boolean;
}

export interface ItemTransaction {
  id?: number; // 'id' є необов'язковим
  itemName: string;
  type: 'lend' | 'borrow';
  date: number; // Зберігаємо як timestamp (число)
  description?: string | null;
  counterpartyId: number; // Змінено на number, оскільки Dexie ID це number
  returnDate?: number | null; // Зберігаємо як timestamp (число)
}