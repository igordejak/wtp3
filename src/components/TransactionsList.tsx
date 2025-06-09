// src/components/TransactionsList.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../database'; // Імпортуємо екземпляр бази даних Dexie
import type { MoneyTransaction, ItemTransaction, StuffItem } from '../database/models';
// Імпортуємо liveQuery з Dexie
import { liveQuery } from 'dexie';

// Компонент для відображення однієї грошової транзакції
const MoneyTransactionItem: React.FC<{ transaction: MoneyTransaction }> = ({ transaction }) => {
  const [counterpartyName, setCounterpartyName] = useState<string>('Завантаження...');

  useEffect(() => {
    // Використовуємо liveQuery для реактивного отримання імені контрагента
    const subscription = liveQuery(async () => {
      if (transaction.stuffItemId) {
        const counterparty = await db.stuffItems.get(transaction.stuffItemId);
        return counterparty?.name || 'N/A';
      }
      return 'N/A';
    }).subscribe(name => {
      setCounterpartyName(name);
    });

    // Очищення підписки при розмонтуванні компонента
    return () => subscription.unsubscribe();
  }, [transaction.stuffItemId]);

  const date = transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Невідома дата';
  const returnDate = transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : 'Не вказано';

  return (
    <div style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '5px', backgroundColor: '#e6ffe6' }}>
      <p><strong>Тип активу:</strong> Гроші</p>
      <p><strong>Тип транзакції:</strong> {transaction.type === 'lend' ? 'Позичив' : 'Позичив у'}</p>
      <p><strong>Сума:</strong> {transaction.amount}</p>
      <p><strong>Кому/Від кого:</strong> {counterpartyName}</p>
      <p><strong>Опис:</strong> {transaction.description || 'Відсутній'}</p>
      <p><strong>Дата транзакції:</strong> {date}</p>
      <p><strong>Дата повернення:</strong> {returnDate}</p>
    </div>
  );
};

// Компонент для відображення однієї речової транзакції
const ItemTransactionItem: React.FC<{ transaction: ItemTransaction }> = ({ transaction }) => {
  const [counterpartyName, setCounterpartyName] = useState<string>('Завантаження...');

  useEffect(() => {
    // Використовуємо liveQuery для реактивного отримання імені контрагента
    const subscription = liveQuery(async () => {
      if (transaction.counterpartyId) {
        const counterparty = await db.stuffItems.get(transaction.counterpartyId);
        return counterparty?.name || 'N/A';
      }
      return 'N/A';
    }).subscribe(name => {
      setCounterpartyName(name);
    });

    return () => subscription.unsubscribe();
  }, [transaction.counterpartyId]);

  const date = transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Невідома дата';
  const returnDate = transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : 'Не вказано';

  return (
    <div style={{ border: '1px dashed #ccc', padding: '10px', marginBottom: '5px', backgroundColor: '#ffe6e6' }}>
      <p><strong>Тип активу:</strong> Речі</p>
      <p><strong>Тип транзакції:</strong> {transaction.type === 'lend' ? 'Позичив' : 'Позичив у'}</p>
      <p><strong>Назва речі:</strong> {transaction.itemName}</p>
      <p><strong>Кому/Від кого:</strong> {counterpartyName}</p>
      <p><strong>Опис:</strong> {transaction.description || 'Відсутній'}</p>
      <p><strong>Дата транзакції:</strong> {date}</p>
      <p><strong>Дата повернення:</strong> {returnDate}</p>
    </div>
  );
};

// ----- Основний компонент списку -----
const TransactionsList: React.FC = () => {
  const [moneyTransactions, setMoneyTransactions] = useState<MoneyTransaction[]>([]);
  const [itemTransactions, setItemTransactions] = useState<ItemTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // liveQuery для грошових транзакцій
    const moneySub = liveQuery(async () => {
      return await db.moneyTransactions.toArray();
    }).subscribe(transactions => {
      setMoneyTransactions(transactions);
      setLoading(false); // Завантаження завершено після перших даних
    }, error => {
      console.error("Помилка liveQuery грошових транзакцій:", error);
      setLoading(false);
    });

    // liveQuery для речових транзакцій
    const itemSub = liveQuery(async () => {
      return await db.itemTransactions.toArray();
    }).subscribe(transactions => {
      setItemTransactions(transactions);
      setLoading(false); // Завантаження завершено після перших даних
    }, error => {
      console.error("Помилка liveQuery речових транзакцій:", error);
      setLoading(false);
    });

    // Функція очищення (відписка від змін)
    return () => {
      moneySub.unsubscribe();
      itemSub.unsubscribe();
    };
  }, []); // Пустий масив залежностей означає, що ефект запускається один раз при монтуванні

  if (loading) {
    return <p>Завантаження транзакцій...</p>;
  }

  return (
    <div style={{ marginTop: '40px' }}>
      <h2>Мої транзакції</h2>

      {(moneyTransactions.length === 0) &&
       (itemTransactions.length === 0) && (
        <p>Поки що немає транзакцій. Додайте першу!</p>
      )}

      {moneyTransactions.length > 0 && (
        <>
          <h3>Грошові транзакції:</h3>
          {moneyTransactions.map(t => (
            <MoneyTransactionItem key={t.id} transaction={t} />
          ))}
        </>
      )}

      {itemTransactions.length > 0 && (
        <>
          <h3 style={{marginTop: '20px'}}>Речові транзакції:</h3>
          {itemTransactions.map(t => (
            <ItemTransactionItem key={t.id} transaction={t} />
          ))}
        </>
      )}
    </div>
  );
};

export default TransactionsList;