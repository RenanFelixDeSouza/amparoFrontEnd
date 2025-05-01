import React from 'react';
import './DetailsTransactionModal.css';
import { FaTimes, FaMoneyBillWave, FaUniversity, FaInfoCircle } from 'react-icons/fa';

function DetailsTransactionModal({ transaction, onClose }) {
  if (!transaction) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="details-transaction-modal-overlay" onClick={onClose}>
      <div className="details-transaction-modal-content" onClick={e => e.stopPropagation()}>
        <div className="details-transaction-modal-header">
          <h2>
            <FaMoneyBillWave className="modal-icon" />
            <span className={transaction.type === 'entrada' ? 'entrada' : 'saida'}>
              {formatCurrency(transaction.value)}
            </span>
          </h2>
          <button className="details-transaction-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="details-transaction-modal-body">
          <div className="details-transaction-section">
            <div className="section-title">
              <FaUniversity className="section-icon" />
              <h3>Conta</h3>
            </div>
            <div className="details-transaction-info">
              <p><strong>{transaction.wallet.bank_name}</strong></p>
              <p>Agência: {transaction.wallet.agency}</p>
              <p>Conta: {transaction.wallet.account_number}</p>
              <p>Saldo Atual: {formatCurrency(transaction.wallet.total_value)}</p>
            </div>
          </div>

          <div className="details-transaction-section">
            <div className="section-title">
              <FaInfoCircle className="section-icon" />
              <h3>Detalhes</h3>
            </div>
            <div className="details-transaction-info">
              <p>Data: {formatDate(transaction.created_at)}</p>
              <p>Tipo: <span className={transaction.type === 'entrada' ? 'entrada' : 'saida'}>
                {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
              </span></p>
              <p>Descrição: {transaction.comments || '-'}</p>
              <p>Registrado por: {transaction.user.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsTransactionModal;