// src/database/models/ItemTransaction.ts

export interface ItemTransaction {
  id?: number; // Автоматично генерується Dexie, тому необов'язковий для нових записів
  itemName: string; // Назва самої речі
  type: 'lend' | 'borrow'; // Тип транзакції
  date: number; // Дата транзакції, зберігається як Unix timestamp (число)
  description?: string | null; // Опис транзакції (опціонально), додано null для узгодженості
  counterpartyId: number; // ID контрагента (людини/банку/тощо), тепер це число (як ID в Dexie)
  returnDate?: number | null; // Опціональна дата повернення, зберігається як Unix timestamp (число)
}