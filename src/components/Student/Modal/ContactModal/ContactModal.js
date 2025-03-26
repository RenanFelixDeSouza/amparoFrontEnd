/**
 * Componente ContactModal 
 * Modal para envio de mensagens via WhatsApp para alunos e responsáveis
 */

import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaWhatsapp } from 'react-icons/fa';
import './ContactModal.css';

function ContactModal({ isOpen, onClose, student }) {
  const [message, setMessage] = useState('');

  /**
   * Formata número e abre WhatsApp
   */
  const handleWhatsAppClick = (phoneNumber) => {
    const formattedMessage = encodeURIComponent(message);
    // Remove todos os caracteres não numéricos do telefone
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/55${formattedPhone}?text=${formattedMessage}`, '_blank');
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Não informado';
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    // Se o número já estiver formatado, retorna como está
    if (phone.match(/^\(\d{2}\) \d{4,5}-\d{4}$/)) {
      return phone;
    }
    return phone;
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="edit-student-modal-content">
        <h2>Enviar Mensagem</h2>
        
        <div className="contacts-list">
          {/* Seção do Aluno */}
          {student?.studentContact?.phone_number && (
            <div className="contacts-section">
              <div className="contacts-section-title">Aluno</div>
              <div className="contact-item">
                <div className="contact-info">
                  <span className="contact-name">{student.studentContact.name}</span>
                  <span className="contact-phone">{formatPhoneNumber(student.studentContact.phone_number)}</span>
                </div>
                <button
                  className="whatsapp-button"
                  onClick={() => handleWhatsAppClick(student.studentContact.phone_number)}
                  disabled={!message.trim()}
                >
                  <FaWhatsapp />
                </button>
              </div>
            </div>
          )}

          {/* Seção dos Responsáveis */}
          {student?.responsiblesContacts?.length > 0 && (
            <div className="contacts-section">
              <div className="contacts-section-title">Responsáveis</div>
              {student.responsiblesContacts.map((responsible, index) => (
                <div key={index} className="contact-item">
                  <div className="contact-info">
                    <span className="contact-name">{responsible.name}</span>
                    <span className="contact-relation">({responsible.relation})</span>
                    <span className="contact-phone">{formatPhoneNumber(responsible.phone_number)}</span>
                  </div>
                  <button
                    className="whatsapp-button"
                    onClick={() => handleWhatsAppClick(responsible.phone_number)}
                    disabled={!message.trim()}
                  >
                    <FaWhatsapp />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <textarea
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          rows={4}
        />

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ContactModal;
