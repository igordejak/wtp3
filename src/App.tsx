
import './App.module.scss'
import AddTransactionForm from './components/AddTransactionForm'; // <--- Імпортуємо нову форму
import TransactionsList from './components/TransactionsList';


function App() {
  

  return (
<>
     
      <AddTransactionForm />

       <div style={{ marginTop: '40px' }}>
        <h2>Мої транзакції</h2>
       
        <TransactionsList />
      </div>
</>
  )
}

export default App
