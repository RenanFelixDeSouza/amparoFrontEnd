import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AddTransaction = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAccounts();
  }, []);

  const getAccounts = async () => {
    try {
      const response = await api.get('/wallets/index');
      setAccounts(response.data.wallets || []);
    } catch (error) {
      setError('Erro ao carregar contas bancárias');
      console.error('Erro:', error);
    }
  };

  const handleAddTransaction = async (transaction) => {
    try {
      await api.post('/transactions/add', transaction);
      alert('Transação adicionada com sucesso!');
    } catch (error) {
      setError('Erro ao adicionar transação');
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      <h1>Adicionar Transação</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const transaction = {
            accountId: e.target.accountId.value,
            amount: e.target.amount.value,
          };
          handleAddTransaction(transaction);
        }}
      >
        <label>
          Conta:
          <select name="accountId">
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Valor:
          <input type="number" name="amount" required />
        </label>
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
};

export default AddTransaction;