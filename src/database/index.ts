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

    this.version(1).stores({
      moneyTransactions: '++id, amount, type, date, stuffItemId, returnDate',
      itemTransactions: '++id, itemName, type, date, counterpartyId, returnDate',
      stuffItems: '++id, name, isPerson',
    });

    this.moneyTransactions = this.table('moneyTransactions');
    this.itemTransactions = this.table('itemTransactions');
    this.stuffItems = this.table('stuffItems');
  }
}

export const db = new MyDatabase();