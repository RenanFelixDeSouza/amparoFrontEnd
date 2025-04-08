import React, { useState, useEffect } from "react";
import api from "../../../../../services/api";
import ModalRace from "../../../AddPet/Modal/Race/ModalRace";
import ModalSpecie from "../../../AddPet/Modal/Specie/ModalSpecie";

function EditPetModal({ pet, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: pet?.name || "",
    specie: pet?.specie || "",
    race: pet?.race || "",
    birth_date: pet?.birth_date || "",
    is_castrated: pet?.is_castrated || false,
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(pet?.photo_url || null);
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [raceError, setRaceError] = useState("");
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [specieError, setSpecieError] = useState("");
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const [isSpecieModalOpen, setIsSpecieModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      birth_date: pet?.birth_date ? pet.birth_date.split(" ")[0] : "",
    }));
  }, [pet]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("O tamanho da imagem deve ser menor que 2MB.");
        return;
      }
      setError("");
      setFormData({ ...formData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
      setIsPhotoChanged(true);
    }
  };

  const handlePhotoSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.photo) {
      setError("Nenhuma foto selecionada.");
      return;
    }

    try {
      const photoData = new FormData();
      photoData.append("photo", formData.photo);

      const response = await api.post(`/pets/${pet.id}/upload-photo`, photoData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Foto enviada com sucesso!");
      if (response.data.photo_url) {
        setPhotoPreview(response.data.photo_url);
      }
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Erro ao enviar a foto:", error);
      setError("Erro ao enviar a foto. Tente novamente.");
    }
  };

  const handlePhotoDelete = async () => {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/pets/${pet.id}/delete-photo`);
      setSuccess("Foto removida com sucesso!");
      setPhotoPreview(null);
      setFormData({ ...formData, photo: null });
      setIsPhotoChanged(false);
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Erro ao remover a foto:", error);
      setError("Erro ao remover a foto. Tente novamente.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = { ...formData };
      delete data.photo;

      await api.put(`/pets/${pet.id}`, data);
      setSuccess("Dados atualizados com sucesso!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar pet:", error);
      setError("Erro ao salvar os dados. Tente novamente.");
    }
  };

  const fetchRaces = async (raceFilter) => {
    try {
      const response = await api.get("/races/index", { params: { search: raceFilter } });
      setFilteredRaces(response.data.data || []);
    } catch {
      setFilteredRaces([]);
    }
  };

  const handleRaceFilterChange = (e) => {
    const raceFilter = e.target.value;
    setFormData((prev) => ({ ...prev, race: raceFilter }));
    setRaceError("");

    if (raceFilter.length >= 3) {
      fetchRaces(raceFilter);
    } else {
      setFilteredRaces([]);
    }
  };

  const handleRaceSelect = (race) => {
    setFormData((prev) => ({ ...prev, race: race.description }));
    setFilteredRaces([]);
    setRaceError("");
  };

  const fetchSpecies = async (specieFilter) => {
    try {
      const response = await api.get("/species/index", { params: { search: specieFilter } });
      setFilteredSpecies(response.data.data || []);
    } catch {
      setFilteredSpecies([]);
    }
  };

  const handleSpecieFilterChange = (e) => {
    const specieFilter = e.target.value;
    setFormData((prev) => ({ ...prev, specie: specieFilter }));
    setSpecieError("");

    if (specieFilter.length >= 3) {
      fetchSpecies(specieFilter);
    } else {
      setFilteredSpecies([]);
    }
  };

  const handleSpecieSelect = (specie) => {
    setFormData((prev) => ({ ...prev, specie: specie.description }));
    setFilteredSpecies([]);
    setSpecieError("");
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay-edit") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay-edit" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Pet</h2>
        </div>
        <div className="photo-upload-container">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="photo-preview"
            />
          ) : (
            <div className="photo-placeholder">Sem Foto</div>
          )}
          <label htmlFor="photo-upload" className="photo-upload-label">
            Alterar Foto
          </label>
          <input
            type="file"
            id="photo-upload"
            className="photo-upload-input"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {isPhotoChanged && photoPreview && (
            <button type="button" onClick={handlePhotoSubmit} className="save-photo-button">
              Salvar Foto
            </button>
          )}
          {photoPreview && (
            <button type="button" onClick={handlePhotoDelete} className="remove-photo-button">
              Remover Foto
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            <div className="form-group-inline">
              <div className="form-group">
                <label htmlFor="pet-name">Nome:</label>
                <input
                  type="text"
                  id="pet-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pet-birth-date">Data de Nascimento:</label>
                <input
                  type="date"
                  id="pet-birth-date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group-inline">
              <div className="form-group">
                <label htmlFor="pet-race">Raça:</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="pet-race"
                    name="race"
                    value={formData.race}
                    onChange={handleRaceFilterChange}
                    placeholder="Buscar raças"
                  />
                  {filteredRaces.length > 0 && (
                    <ul className="add-pet-field-list">
                      {filteredRaces.map((race) => (
                        <li key={race.id} onClick={() => handleRaceSelect(race)}>
                          {`${race.id} - ${race.description}`}
                        </li>
                      ))}
                    </ul>
                  )}
                  {raceError && <div className="error-message">{raceError}</div>}
                  <button
                    type="button"
                    className="open-modal-button"
                    onClick={() => setIsRaceModalOpen(true)}
                  >
                    Abrir Modal
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="pet-specie">Espécie:</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="pet-specie"
                    name="specie"
                    value={formData.specie}
                    onChange={handleSpecieFilterChange}
                    placeholder="Buscar espécies"
                  />
                  {filteredSpecies.length > 0 && (
                    <ul className="add-pet-field-list">
                      {filteredSpecies.map((specie) => (
                        <li key={specie.id} onClick={() => handleSpecieSelect(specie)}>
                          {`${specie.id} - ${specie.description}`}
                        </li>
                      ))}
                    </ul>
                  )}
                  {specieError && <div className="error-message">{specieError}</div>}
                  <button
                    type="button"
                    className="open-modal-button"
                    onClick={() => setIsSpecieModalOpen(true)}
                  >
                    Abrir Modal
                  </button>
                </div>
              </div>
            </div>
            <div className="switch-container">
              <label htmlFor="pet-castrated">Castrado:</label>
              <label className="switch">
                <input
                  type="checkbox"
                  id="pet-castrated"
                  name="is_castrated"
                  checked={formData.is_castrated}
                  onChange={handleInputChange}
                />
                <span className="slider round"></span>
              </label>
              <span>{formData.is_castrated ? "Sim" : "Não"}</span>
            </div>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Salvar</button>
          </div>
        </form>
        {isRaceModalOpen && (
          <ModalRace
            isOpen={isRaceModalOpen}
            onClose={() => setIsRaceModalOpen(false)}
            onSave={(selectedRace) => setFormData((prev) => ({ ...prev, race: selectedRace.description }))}
          />
        )}
        {isSpecieModalOpen && (
          <ModalSpecie
            isOpen={isSpecieModalOpen}
            onClose={() => setIsSpecieModalOpen(false)}
            onSave={(selectedSpecie) => setFormData((prev) => ({ ...prev, specie: selectedSpecie.description }))}
          />
        )}
      </div>
    </div>
  );
}

export default EditPetModal;
