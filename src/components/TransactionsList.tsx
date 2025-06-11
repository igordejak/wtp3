// src/components/TransactionsList.tsx
import React, { useState,   useMemo } from 'react';
import styles from './TransactionsList.module.scss';
import { db } from '../database'; // Імпортуємо екземпляр бази даних Dexie
import type { MoneyTransaction, ItemTransaction, StuffItem } from '../database/models';
// Імпортуємо useLiveQuery з dexie-react-hooks для використання в головному компоненті
import { useLiveQuery } from 'dexie-react-hooks';

// --- Компонент для відображення однієї грошової транзакції ---
// Додаємо проп onDelete, який є функцією, що приймає ID транзакції
const MoneyTransactionItem: React.FC<{
  transaction: MoneyTransaction;
  counterparty: StuffItem | undefined; // Передаємо контрагента напряму
  onDelete: (id: number, type: 'money' | 'item') => void;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
}> = ({ transaction, counterparty, onDelete, isExpanded, onToggleExpand }) => {

  const date = transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Невідома дата';
  const returnDate = transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : 'Не вказано';

  // Використовуємо .id!, тому що ми перевіряємо його існування перед рендером
  const handleDeleteClick = () => {
    if (transaction.id) {
      onDelete(transaction.id, 'money');
    }
  };

  return (
    <div className={styles.actionRow} onClick={() => onToggleExpand(transaction.id!)}>
      <div className={styles.partOne}>
        <p className={styles.summItem}>{transaction.amount} {transaction.currency}</p>
        <p className={styles.nameOf}><b>{transaction.type === 'lend' ? 'Кому' : 'Від кого'}:</b> {counterparty?.name || 'N/A'}</p>
        <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }} className={styles.deleteButton}>
          Видалити
        </button>
      </div>

      {isExpanded && (
        <div className={styles.details}>
          <p><b>Опис:</b> {transaction.description || '-'}</p>
          <p><b>Запис створено:</b> {date}</p>
          <p><b>Повернути до:</b> {returnDate}</p>
        </div>
      )}
    </div>
  );
};

// --- Компонент для відображення однієї речової транзакції ---
// Додаємо проп onDelete
const ItemTransactionItem: React.FC<{
  transaction: ItemTransaction;
  counterparty: StuffItem | undefined; // Передаємо контрагента напряму
  onDelete: (id: number, type: 'money' | 'item') => void;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
}> = ({ transaction, counterparty, onDelete, isExpanded, onToggleExpand }) => {

  const date = transaction.date ? new Date(transaction.date).toLocaleDateString() : 'Невідома дата';
  const returnDate = transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString() : 'Не вказано';

  // Використовуємо .id!, тому що ми перевіряємо його існування перед рендером
  const handleDeleteClick = () => {
    if (transaction.id) {
      onDelete(transaction.id, 'item');
    }
  };

  return (
    <div className={styles.actionRow} onClick={() => onToggleExpand(transaction.id!)}>
      <div className={styles.partOne}>
        <p className={styles.summItem}>{transaction.itemName}</p>
        <p className={styles.nameOf}><b>{transaction.type === 'lend' ? 'Кому' : 'Від кого'}:</b> {counterparty?.name || 'N/A'}</p>
        <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }} className={styles.deleteButton}>
          Видалити
        </button>
      </div>

      {isExpanded && (
        <div className={styles.details}>
          <p><b>Опис:</b> {transaction.description || '-'}</p>
          <p><b>Запис створено:</b> {date}</p>
          <p><b>Повернути до:</b> {returnDate}</p>
        </div>
      )}
    </div>
  );
};

const TransactionsList: React.FC = () => {
  // Використовуємо useLiveQuery для реактивного отримання всіх грошових транзакцій
  const moneyTransactions = useLiveQuery(
    () => db.moneyTransactions.toArray(),
    [] // Залежності, порожні для запуску один раз
  );

  // Використовуємо useLiveQuery для реактивного отримання всіх речових транзакцій
  const itemTransactions = useLiveQuery(
    () => db.itemTransactions.toArray(),
    [] // Залежності, порожні для запуску один раз
  );

  // Отримуємо всіх контрагентів за допомогою useLiveQuery
  const stuffItems = useLiveQuery(
    () => db.stuffItems.toArray(),
    []
  );

  // Об'єкт для швидкого пошуку контрагента за ID
  // useMemo забезпечує, що мапа перестворюється тільки коли змінюється stuffItems
  const stuffItemMap = useMemo(() => {
    const map = new Map<number, StuffItem>();
    stuffItems?.forEach(item => {
      if (item.id !== undefined) { // Перевірка на існування ID
        map.set(item.id, item);
      }
    });
    return map;
  }, [stuffItems]);

  // Стан для відстеження розгорнутих транзакцій
  const [expandedMoneyIds, setExpandedMoneyIds] = useState<Set<number>>(new Set());
  const [expandedItemIds, setExpandedItemIds] = useState<Set<number>>(new Set());

  const handleToggleExpand = (id: number, type: 'money' | 'item') => {
    if (type === 'money') {
      setExpandedMoneyIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else {
      setExpandedItemIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    }
  };

  // --- ФУНКЦІЯ ВИДАЛЕННЯ ТРАНЗАКЦІЙ ---
  const handleDeleteTransaction = async (id: number, type: 'money' | 'item') => {
    if (!window.confirm(`Ви впевнені, що хочете видалити цю ${type === 'money' ? 'грошову' : 'речову'} транзакцію?`)) {
      return; // Якщо користувач відхилив підтвердження
    }

    try {
      if (type === 'money') {
        await db.moneyTransactions.delete(id);
        // Видаляємо ID з розгорнутих, якщо вона була розгорнута
        setExpandedMoneyIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        console.log(`Грошова транзакція з ID ${id} видалена.`);
      } else { // type === 'item'
        await db.itemTransactions.delete(id);
        // Видаляємо ID з розгорнутих, якщо вона була розгорнута
        setExpandedItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        console.log(`Речова транзакція з ID ${id} видалена.`);
      }
      alert('Транзакцію успішно видалено!');
    } catch (error) {
      console.error(`Помилка при видаленні ${type} транзакції з ID ${id}:`, error);
      alert(`Помилка при видаленні транзакції: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  // ------------------------------------

  // Показати завантаження, якщо будь-яка з колекцій ще не завантажена
  if (moneyTransactions === undefined || itemTransactions === undefined || stuffItems === undefined) {
    return <div>Завантаження транзакцій...</div>;
  }

  // --- Логіка для розділення на 4 секції ---
  const lentMoneyTransactions = moneyTransactions.filter(t => t.type === 'lend');
  const borrowedMoneyTransactions = moneyTransactions.filter(t => t.type === 'borrow');
  const lentItemTransactions = itemTransactions.filter(t => t.type === 'lend');
  const borrowedItemTransactions = itemTransactions.filter(t => t.type === 'borrow');

  // --- Логіка для підрахунку підсумків за валютами ---
  const moneyTotals: Record<string, { lend: number, borrow: number }> = {};
  moneyTransactions.forEach(t => {
    if (!moneyTotals[t.currency]) {
      moneyTotals[t.currency] = { lend: 0, borrow: 0 };
    }
    if (t.type === 'lend') {
      moneyTotals[t.currency].lend += t.amount;
    } else {
      moneyTotals[t.currency].borrow += t.amount;
    }
  });

  const formatCurrencyTotals = (totals: Record<string, { lend: number, borrow: number }>, type: 'lend' | 'borrow') => {
    return Object.entries(totals)
      .map(([currency, amounts]) => {
        const value = type === 'lend' ? amounts.lend : amounts.borrow;
        return value > 0 ? `${value} ${currency}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  const totalLentMoney = formatCurrencyTotals(moneyTotals, 'lend');
  const totalBorrowedMoney = formatCurrencyTotals(moneyTotals, 'borrow');


  return (
    <div className={styles.listContainer}>
      <h2>Мої позики</h2>

      {/* Повідомлення, якщо транзакцій немає */}
      {moneyTransactions.length === 0 && itemTransactions.length === 0 && (
        <p className={styles.noRecords}>Поки що немає записів. Додайте перший!</p>
      )}

      {/* Секція "Гроші, які мені винні" */}
      {lentMoneyTransactions.length > 0 && (
        <div className={styles.section}>
          <h3>Я надав гроші</h3>
          <div className={styles.transactionList}>
            {lentMoneyTransactions.map(transaction => (
              <MoneyTransactionItem
                key={transaction.id}
                transaction={transaction}
                counterparty={stuffItemMap.get(transaction.stuffItemId)}
                onDelete={handleDeleteTransaction}
                isExpanded={expandedMoneyIds.has(transaction.id!)}
                onToggleExpand={(id) => handleToggleExpand(id, 'money')}
              />
            ))}
          </div>
          {(totalLentMoney) && (
        <div className={styles.totalsSection}>
          {totalLentMoney && <p className={styles.totalIn}>Всього мені винні: <b>{totalLentMoney}</b></p>}
        </div>
      )}
        </div>
      )}
      

      {/* Секція "Гроші, які я винен" */}
      {borrowedMoneyTransactions.length > 0 && (
        <div className={styles.section}>
          <h3>Я взяв гроші</h3>
          <div className={styles.transactionList}>
            {borrowedMoneyTransactions.map(transaction => (
              <MoneyTransactionItem
                key={transaction.id}
                transaction={transaction}
                counterparty={stuffItemMap.get(transaction.stuffItemId)}
                onDelete={handleDeleteTransaction}
                isExpanded={expandedMoneyIds.has(transaction.id!)}
                onToggleExpand={(id) => handleToggleExpand(id, 'money')}
              />
            ))}
          </div>
          {(totalBorrowedMoney) && (
        <div className={styles.totalsSection}>
          {totalBorrowedMoney && <p className={styles.totalOut}>Всього я винен: <b>{totalBorrowedMoney}</b></p>}
        </div>
      )}

        </div>
      )}
      

      {/* Секція "Речі, які мені винні" */}
      {lentItemTransactions.length > 0 && (
        <div className={styles.section}>
          <h3>Я надав речі</h3>
          <div className={styles.transactionList}>
            {lentItemTransactions.map(transaction => (
              <ItemTransactionItem
                key={transaction.id}
                transaction={transaction}
                counterparty={stuffItemMap.get(transaction.counterpartyId)}
                onDelete={handleDeleteTransaction}
                isExpanded={expandedItemIds.has(transaction.id!)}
                onToggleExpand={(id) => handleToggleExpand(id, 'item')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Секція "Речі, які я винен" */}
      {borrowedItemTransactions.length > 0 && (
        <div className={styles.section}>
          <h3>Я взяв речі</h3>
          <div className={styles.transactionList}>
            {borrowedItemTransactions.map(transaction => (
              <ItemTransactionItem
                key={transaction.id}
                transaction={transaction}
                counterparty={stuffItemMap.get(transaction.counterpartyId)}
                onDelete={handleDeleteTransaction}
                isExpanded={expandedItemIds.has(transaction.id!)}
                onToggleExpand={(id) => handleToggleExpand(id, 'item')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;