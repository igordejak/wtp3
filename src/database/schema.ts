// src/database/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

const appDbSchema = appSchema({
  version: 3, // Початкова версія схеми. Збільшуйте її при змінах схеми!
  tables: [
    tableSchema({
      name: 'money_transactions', // Назва таблиці в базі даних
      columns: [
        { name: 'amount', type: 'number' },
        { name: 'type', type: 'string' }, // 'lend' або 'borrow'
        { name: 'date', type: 'number' }, // Timestamp
        { name: 'description', type: 'string', isOptional: true },
        { name: 'stuff_item_id', type: 'string', isIndexed: true }, 
         { name: 'return_date', type: 'number', isOptional: true }, // Зовнішній ключ до StuffItem
      ],
    }),
    tableSchema({
      name: 'stuff_items', // Назва таблиці для 'StuffItem' (люди/речі)
      columns: [
        { name: 'name', type: 'string' },
        { name: 'contact_info', type: 'string', isOptional: true },
        { name: 'is_person', type: 'boolean' }, // true для людей, false для речей/об'єктів
      ],
    }),
    tableSchema({
      name: 'item_transactions', // Назва таблиці
      columns: [
        { name: 'item_name', type: 'string' }, // Назва речі
        { name: 'type', type: 'string' }, // 'lend' або 'borrow'
        { name: 'date', type: 'number' }, // Дата транзакції
        { name: 'description', type: 'string', isOptional: true },
        { name: 'counterparty_id', type: 'string', isIndexed: true }, // Зовнішній ключ до StuffItem (контрагента)
        { name: 'return_date', type: 'number', isOptional: true }, // Дата повернення
      ],
    }),
  ],
});

export default appDbSchema; // Експортуємо схему за замовчуванням