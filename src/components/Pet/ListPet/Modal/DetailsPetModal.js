import React from "react";

function DetailsPetModal({ pet, onClose }) {
  if (!pet) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Detalhes do Pet</h2>
        </div>
        {pet.photo_url && (
          <img
            src={pet.photo_url}
            alt={`Foto de ${pet.name}`}
          />
        )}
        <div className="modal-form-body">
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="pet-name">Nome:</label>
              <input
                type="text"
                disabled
                id="pet-name"
                value={pet.name}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pet-specie">Espécie:</label>
              <input
                type="text"
                disabled
                id="pet-specie"
                value={pet.specie}
              />
            </div>
          </div>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="pet-race">Raça:</label>
              <input
                type="text"
                disabled
                id="pet-race"
                value={pet.race}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pet-castrated">Castrado:</label>
              <input
                type="text"
                disabled
                id="pet-castrated"
                value={pet.is_castrated ? "Sim" : "Não"}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pet-birth-date">Data de Nascimento:</label>
              <input
                type="text"
                disabled
                id="pet-birth-date"
                value={pet.birth_date ? new Date(pet.birth_date).toLocaleDateString("pt-BR") : "Desconhecida"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsPetModal;