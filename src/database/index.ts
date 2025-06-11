// src/database/index.ts
import Dexie, { type Table } from 'dexie';
import type { MoneyTransaction, ItemTransaction, StuffItem } from './models';
// Імпортуємо dexie-observable
import 'dexie-observable';

class MyDatabase extends Dexie {
  moneyTransactions!: Table<MoneyTransaction>;
  itemTransactions!: Table<ItemTransaction>;
  stuffItems!: Table<StuffItem>;

  constructor() {
    super('wtp_dexie_db');

    // Дефініція схеми для ВЕРСІЇ 1
    // Це ваші поточні таблиці, які вже існують
    this.version(1).stores({
      moneyTransactions: '++id, amount, type, date, stuffItemId, returnDate',
      itemTransactions: '++id, itemName, type, date, counterpartyId, returnDate',
      stuffItems: '++id, name, isPerson',
    });

    // Дефініція схеми для ВЕРСІЇ 2
    // Збільшуємо версію та додаємо 'currency' до moneyTransactions
    this.version(2).stores({
      moneyTransactions: '++id, amount, type, date, stuffItemId, returnDate, currency', // <--- ДОДАНО: currency
      itemTransactions: '++id, itemName, type, date, counterpartyId, returnDate', // Залишаємо як є
      stuffItems: '++id, name, isPerson', // Залишаємо як є
    })
    .upgrade(async tx => {
      // Цей блок виконується лише один раз, коли користувач оновлює додаток
      // з версії DB 1 до версії DB 2.
      // Тут ми додаємо значення за замовчуванням для нового поля 'currency'
      // до вже існуючих записів у таблиці 'moneyTransactions'.
      console.log("Виконується міграція з версії 1 на версію 2: додавання поля 'currency'");
      await tx.table('moneyTransactions').toCollection().modify(transaction => {
        // Якщо поле currency не визначено (для старих записів), встановлюємо UAH за замовчуванням.
        if (transaction.currency === undefined) {
          transaction.currency = 'UAH'; // Можете змінити на іншу валюту за замовчуванням
        }
      });
      console.log("Міграція завершена.");
    });


    this.moneyTransactions = this.table('moneyTransactions');
    this.itemTransactions = this.table('itemTransactions');
    this.stuffItems = this.table('stuffItems');
  }
}

export const db = new MyDatabase();