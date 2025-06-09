// src/components/AddTransactionForm.tsx
import React, { useState } from 'react';
import { db } from '../database';
import type { MoneyTransaction, ItemTransaction, StuffItem } from '../database/models';

const AddTransactionForm: React.FC = () => {
  // State for transaction type selection (initially null, so no form is shown)
  const [transactionType, setTransactionType] = useState<'money' | 'item' | null>(null);

  // States for form fields
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'lend' | 'borrow'>('lend'); // Type of lend/borrow
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Function to reset form fields (useful after adding a transaction)
  const resetForm = () => {
    setAmount('');
    setType('lend');
    setItemName('');
    setDescription('');
    setCounterpartyName('');
    setReturnDate('');
    // Do NOT reset transactionType to null here if you want to keep the form visible after submission
    // If you want the form to hide again, setTransactionType(null);
  };

  const handleAddTransaction = async () => {
    if (!counterpartyName) {
      alert('Будь ласка, введіть ім\'я контрагента.');
      return;
    }
    if (transactionType === 'money' && !amount) {
      alert('Будь ласка, введіть суму.');
      return;
    }
    if (transactionType === 'item' && !itemName) {
      alert('Будь ласка, введіть назву речі.');
      return;
    }
    if (!transactionType) { // Should not happen if form is displayed conditionally, but good for safety
        alert('Будь ласка, виберіть тип транзакції.');
        return;
    }

    try {
      // 1. Знаходимо або створюємо контрагента (StuffItem)
      let counterparty: StuffItem | undefined;

      counterparty = await db.stuffItems.where('name').equalsIgnoreCase(counterpartyName).first();

      if (!counterparty) {
        // Якщо контрагента не знайдено, створюємо нового
        const newCounterparty: StuffItem = {
          name: counterpartyName,
          contactInfo: null,
          // Оскільки ми прибрали прапорець, встановлюємо isPerson в true за замовчуванням
          // Або можна встановити в false, якщо більшість контрагентів - не люди
          isPerson: true, // Прибрано з форми, встановлюємо за замовчуванням
        };
        const newCounterpartyId = await db.stuffItems.add(newCounterparty);
        counterparty = { ...newCounterparty, id: newCounterpartyId };
      }
      
      if (counterparty?.id === undefined) {
        throw new Error('Не вдалося отримати ID контрагента.');
      }

      const currentDate = Date.now();
      const parsedReturnDate = returnDate ? new Date(returnDate).getTime() : null; // Changed undefined to null for consistency with schema

      if (transactionType === 'money') {
        const newTransaction: MoneyTransaction = {
          amount: parseFloat(amount),
          type: type,
          date: currentDate,
          description: description || null,
          stuffItemId: counterparty.id,
          returnDate: parsedReturnDate,
        };
        await db.moneyTransactions.add(newTransaction);
        console.log('Грошова транзакція додана:', newTransaction);
      } else { // item transaction
        const newTransaction: ItemTransaction = {
          itemName: itemName,
          type: type,
          date: currentDate,
          description: description || null,
          counterpartyId: counterparty.id,
          returnDate: parsedReturnDate,
        };
        await db.itemTransactions.add(newTransaction);
        console.log('Речова транзакція додана:', newTransaction);
      }

      alert('Транзакція успішно додана!');
      resetForm(); // Reset fields after successful submission

    } catch (error) {
      console.error('Помилка при додаванні транзакції:', error);
      alert(`Помилка: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', maxWidth: '500px', margin: '20px auto' }}>
      <h2>Додати нову транзакцію</h2>

      {/* Кнопки вибору типу транзакції - завжди видимі */}
      <div>
        <label>
          <input
            type="radio"
            value="money"
            checked={transactionType === 'money'}
            onChange={() => { setTransactionType('money'); resetForm(); }} // Reset form when switching type
          />
          Грошова
        </label>
        <label style={{ marginLeft: '15px' }}>
          <input
            type="radio"
            value="item"
            checked={transactionType === 'item'}
            onChange={() => { setTransactionType('item'); resetForm(); }} // Reset form when switching type
          />
          Речова
        </label>
      </div>

      {/* Основна частина форми - відображається тільки після вибору типу */}
      {transactionType && (
        <>
          <div style={{ marginTop: '10px' }}>
            <label>
              Тип транзакції:
              <select value={type} onChange={(e) => setType(e.target.value as 'lend' | 'borrow')} style={{ marginLeft: '10px' }}>
                <option value="lend">Я позичив (мені повинні)</option>
                <option value="borrow">Я позичив у (я винен)</option>
              </select>
            </label>
          </div>

          {transactionType === 'money' && (
            <div style={{ marginTop: '10px' }}>
              <label>
                Сума:
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                />
              </label>
            </div>
          )}

          {transactionType === 'item' && (
            <div style={{ marginTop: '10px' }}>
              <label>
                Назва речі:
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                />
              </label>
            </div>
          )}

          <div style={{ marginTop: '10px' }}>
            <label>
              Опис:
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px', width: '80%' }}
              />
            </label>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>
              Контрагент (ім'я):
              <input
                type="text"
                value={counterpartyName}
                onChange={(e) => setCounterpartyName(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>

          {/* Видалено поле "Контрагент - людина?" */}
          {/* <div style={{ marginTop: '10px' }}>
            <label>
              Контрагент - людина?
              <input
                type="checkbox"
                checked={isPerson}
                onChange={(e) => setIsPerson(e.target.checked)}
                style={{ marginLeft: '10px' }}
              />
            </label>
          </div> */}

          <div style={{ marginTop: '10px' }}>
            <label>
              Дата повернення (опц.):
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>

          <button onClick={handleAddTransaction} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Додати транзакцію
          </button>
        </>
      )}
    </div>
  );
};

export default AddTransactionForm;