/**
 * Componente ResponsibleModal
 * Modal para adicionar/editar responsáveis do aluno
 */

import React, { useState, useEffect } from "react";
import "./ResponsibleModal.css";

function ResponsibleModal({
  setShowModal,
  setResponsibles,
  responsibles,
  responsibleIndex,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relation, setRelation] = useState("");

  /**
   * Carrega dados do responsável para edição
   */
  useEffect(() => {
    if (responsibleIndex !== undefined && responsibles[responsibleIndex]) {
      const responsible = responsibles[responsibleIndex];
      setFirstName(responsible.first_name);
      setLastName(responsible.last_name);
      setEmail(responsible.email);
      setPhoneNumber(responsible.phone_number || "");
      setRelation(responsible.relation || "");
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setRelation("");
    }
  }, [responsibleIndex, responsibles]);

  const handleAddResponsible = () => {
    if (!firstName || !lastName || !email) {
      alert("Nome, sobrenome e e-mail são obrigatórios!");
      return;
    }

    const newResponsible = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      relation: relation,
    };

    if (responsibleIndex !== undefined) {
      const updatedResponsibles = [...responsibles];
      updatedResponsibles[responsibleIndex] = newResponsible;
      setResponsibles(updatedResponsibles);
    } else {
      setResponsibles([...responsibles, newResponsible]);
    }

    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setRelation("");
    setShowModal(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal"  onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" >
          <button className="close-button" onClick={() => setShowModal(false)}>
            &times;
          </button>
          <h2>
            {responsibleIndex !== undefined ? "Editar Responsável" : "Adicionar Responsável"}
          </h2>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="first-name">Nome:</label>
              <input
                type="text"
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last-name">Sobrenome:</label>
              <input
                type="text"
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group-inline">

            <div className="form-group">
              <label htmlFor="email">E-mail:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Número de Telefone:</label>
              <input
                type="text"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="relation">Parentesco:</label>
            <input
              type="text"
              id="relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
            />
          </div>


          
        </div>
          <div className="modal-buttons">
            <button type="button" onClick={handleAddResponsible}>
              {responsibleIndex !== undefined ? "Salvar" : "Adicionar"}
            </button>
            <button type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
          </div>
      </div>
    </div>
  );
}

export default ResponsibleModal;