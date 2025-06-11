// src/components/AddTransactionForm.tsx
import React, { useState } from "react";
import { db } from "../database";
import type {
  MoneyTransaction,
  ItemTransaction,
  StuffItem,
} from "../database/models";
import styles from "./AddTransactionForm.module.scss";

const AddTransactionForm: React.FC = () => {
  // State for transaction type selection (initially null, so no form is shown)
  const [transactionType, setTransactionType] = useState<
    "money" | "item" | null
  >(null);

  // States for form fields
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"lend" | "borrow">("lend"); // Type of lend/borrow
  const [currency, setCurrency] = useState("");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Function to reset form fields (useful after adding a transaction)
  const resetForm = () => {
    setAmount("");
    setType("lend");
    setCurrency("UAH");
    setItemName("");
    setDescription("");
    setCounterpartyName("");
    setReturnDate("");
    // Do NOT reset transactionType to null here if you want to keep the form visible after submission
    // If you want the form to hide again, setTransactionType(null);
  };

  const handleAddTransaction = async () => {
    if (!counterpartyName) {
      alert("Будь ласка, введіть ім'я контрагента.");
      return;
    }
    if (transactionType === "money" && !amount) {
      alert("Будь ласка, введіть суму.");
      return;
    }
    if (transactionType === "item" && !itemName) {
      alert("Будь ласка, введіть назву речі.");
      return;
    }
    if (!transactionType) {
      // Should not happen if form is displayed conditionally, but good for safety
      alert("Будь ласка, виберіть тип транзакції.");
      return;
    }

    try {
      // 1. Знаходимо або створюємо контрагента (StuffItem)
      let counterparty: StuffItem | undefined;

      counterparty = await db.stuffItems
        .where("name")
        .equalsIgnoreCase(counterpartyName)
        .first();

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
        throw new Error("Не вдалося отримати ID контрагента.");
      }

      const currentDate = Date.now();
      const parsedReturnDate = returnDate
        ? new Date(returnDate).getTime()
        : null; // Changed undefined to null for consistency with schema

      if (transactionType === "money") {
        const newTransaction: MoneyTransaction = {
          amount: parseFloat(amount),
          type: type,
          currency: currency,
          date: currentDate,
          description: description || null,
          stuffItemId: counterparty.id,
          returnDate: parsedReturnDate,
        };
        await db.moneyTransactions.add(newTransaction);
        console.log("Грошова транзакція додана:", newTransaction);
      } else {
        // item transaction
        const newTransaction: ItemTransaction = {
          itemName: itemName,
          type: type,
          date: currentDate,
          description: description || null,
          counterpartyId: counterparty.id,
          returnDate: parsedReturnDate,
        };
        await db.itemTransactions.add(newTransaction);
        console.log("Речова транзакція додана:", newTransaction);
      }

      alert("Транзакція успішно додана!");
      resetForm(); // Reset fields after successful submission
    } catch (error) {
      console.error("Помилка при додаванні транзакції:", error);
      alert(
        `Помилка: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Додати нову транзакцію</h2>

      {/* Кнопки вибору типу транзакції - завжди видимі */}
      <div>
        <label>
          <input
            type="radio"
            value="money"
            checked={transactionType === "money"}
            onChange={() => {
              setTransactionType("money");
              resetForm();
            }} // Reset form when switching type
          />
          Грошова
        </label>
        <label>
          <input
            type="radio"
            value="item"
            checked={transactionType === "item"}
            onChange={() => {
              setTransactionType("item");
              resetForm();
            }} // Reset form when switching type
          />
          Речова
        </label>
      </div>

      {/* Основна частина форми - відображається тільки після вибору типу */}
      {transactionType && (
        <>
          <div className={styles.fieldBlock}>
            <label>
              Тип транзакції:
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "lend" | "borrow")}
              >
                <option value="lend">Я надав</option>
                <option value="borrow">Я взяв</option>
              </select>
            </label>
          </div>

          {transactionType === "money" && (
            <div className={styles.fieldBlock}>
              <label>
                Сума:
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
            </div>
          )}

          {transactionType === "money" && (
            <div className={styles.fieldBlock}>
              <label>
                Валюта:
                <select
                  value={currency}
                  onChange={(e) =>
                    setCurrency(e.target.value as "UAH" | "USD" | "EUR")
                  }
                >
                  <option value="UAH">UAH</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
            </div>
          )}

          {transactionType === "item" && (
            <div className={styles.fieldBlock}>
              <label>
                Назва речі:
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </label>
            </div>
          )}
          <div className={styles.fieldBlock}>
            <label>
              Кому / У кого (імʼя або назва установи):
              <input
                type="text"
                value={counterpartyName}
                onChange={(e) => setCounterpartyName(e.target.value)}
              />
            </label>
          </div>
          <div className={styles.fieldBlock}>
            <label>
              Деталі (необовʼязково):
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.fieldBlock}>
            <label>
              Дата повернення (опц.):
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </label>
          </div>

          <button onClick={handleAddTransaction}>Додати транзакцію</button>
        </>
      )}
    </div>
  );
};

export default AddTransactionForm;
