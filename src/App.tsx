import styles from "./App.module.scss";
import AddTransactionForm from "./components/AddTransactionForm"; // <--- Імпортуємо нову форму
import TransactionsList from "./components/TransactionsList";

function App() {
  return (
    <div className={styles.wrapper}>
      <TransactionsList />
      <AddTransactionForm />
    </div>
  );
}

export default App;
