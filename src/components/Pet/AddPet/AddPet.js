import React, { useState } from "react";
import "./AddPet.css";
import { FaUser, FaSearch, FaPaw } from "react-icons/fa";
import ModalRace from "./Modal/Race/ModalRace";
import ModalSpecie from "./Modal/Specie/ModalSpecie";
import api from "../../../services/api";

/**
 * Componente para adicionar um novo pet.
 * Permite o preenchimento de informações como nome, cor, data de nascimento, raça, espécie, foto e status de castração.
 * Inclui validações e integração com modais para seleção de raça e espécie.
 */
function AddPet() {
  const [formData, setFormData] = useState({
    name: "",
    specie: "",
    specie_id: null,
    race: "",
    race_id: null,
    birth_date: "",
    is_castrated: false,
  });
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [raceError, setRaceError] = useState("");
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [specieError, setSpecieError] = useState("");
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const [isSpecieModalOpen, setIsSpecieModalOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUnknownBirthDate, setIsUnknownBirthDate] = useState(false);

  /**
   * Manipula a alteração da foto do pet.
   * Valida o formato e o tamanho do arquivo.
   */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "image/png") {
        setPhotoError("Apenas imagens no formato PNG são permitidas.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setPhotoError("O tamanho da imagem deve ser menor que 2MB.");
        return;
      }
      setPhotoError("");
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  /**
   * Remove a foto selecionada.
   */
  const handlePhotoDelete = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError("");
  };

  /**
   * Manipula a alteração do campo de data de nascimento.
   */
  const handleBirthDateChange = (e) => {
    setFormData((prev) => ({ ...prev, birth_date: e.target.value }));
  };

  /**
   * Alterna o estado de "Não sabe a data de nascimento".
   */
  const handleUnknownBirthDateToggle = () => {
    setIsUnknownBirthDate((prev) => !prev);
    if (!isUnknownBirthDate) {
      setFormData((prev) => ({ ...prev, birth_date: "" })); // Limpa o campo de data se for marcado como desconhecido
    }
  };

  /**
   * Submete os dados do formulário para criar um novo pet.
   * Inclui validações e envio de dados para a API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = { ...formData };
      if (!data.race_id) delete data.race_id;
      if (!data.specie_id) delete data.specie_id;

      await api.post("/pets/create", data);

      setSuccessMessage("Pet cadastrado com sucesso!");
      setFormData({
        name: "",
        specie: "",
        specie_id: null,
        race: "",
        race_id: null,
        birth_date: "",
        is_castrated: false,
      });
    } catch (error) {
      const backendMessage = error.response?.data?.message || "Erro ao cadastrar pet. Tente novamente.";
      setErrorMessage(backendMessage);
    }
  };

  /**
   * Busca raças com base no filtro fornecido.
   */
  const fetchRaces = async (raceFilter) => {
    try {
      const response = await api.get("/races/index", { params: { search: raceFilter } });
      setFilteredRaces(response.data.data || []);
    } catch {
      setFilteredRaces([]);
    }
  };

  /**
   * Manipula a alteração do filtro de raças.
   */
  const handleRaceFilterChange = (e) => {
    const raceFilter = e.target.value;
    setFormData((prev) => ({ ...prev, race: raceFilter, race_id: null }));
    setRaceError("");

    if (raceFilter.length >= 3) {
      fetchRaces(raceFilter);
    } else {
      setFilteredRaces([]);
    }
  };

  /**
   * Seleciona uma raça da lista.
   */
  const handleRaceSelect = (race) => {
    setFormData((prev) => ({
      ...prev,
      race: race.description,
      race_id: race.id,
    }));
    setFilteredRaces([]);
    setRaceError("");
  };

  /**
   * Busca espécies com base no filtro fornecido.
   */
  const fetchSpecies = async (specieFilter) => {
    try {
      const response = await api.get("/species/index", { params: { search: specieFilter } });
      setFilteredSpecies(response.data.data || []);
    } catch {
      setFilteredSpecies([]);
    }
  };

  /**
   * Manipula a alteração do filtro de espécies.
   */
  const handleSpecieFilterChange = (e) => {
    const specieFilter = e.target.value;
    setFormData((prev) => ({ ...prev, specie: specieFilter, specie_id: null }));
    setSpecieError("");

    if (specieFilter.length >= 3) {
      fetchSpecies(specieFilter);
    } else {
      setFilteredSpecies([]);
    }
  };

  /**
   * Seleciona uma espécie da lista.
   */
  const handleSpecieSelect = (specie) => {
    setFormData((prev) => ({
      ...prev,
      specie: specie.description,
      specie_id: specie.id,
    }));
    setFilteredSpecies([]);
    setSpecieError("");
  };

  return (
    <div className="add-pet-container">
      <form onSubmit={handleSubmit} className="pet-form">
        <h1 style={{ textAlign: "center" }}>Criar pet</h1>
        <p style={{ textAlign: "center" }}>* Campos obrigatórios</p>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <fieldset>
          <legend>
            <FaUser /> Dados do Pet
          </legend>

          <div className="photo-upload-container">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="photo-preview" />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "#ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaPaw size={50} color="#fff" />
              </div>
            )}
            <label htmlFor="photo-upload" className="photo-upload-label">
              Adicionar Foto
            </label>
            <input
              type="file"
              id="photo-upload"
              className="photo-upload-input"
              accept="image/png"
              onChange={handlePhotoChange}
            />
            {photo && (
              <div className="save-remove-buttons">
                <button
                  type="button"
                  onClick={handlePhotoDelete}
                  className="remove-photo-button"
                >
                  Remover Foto
                </button>
              </div>
            )}
            {photoError && <div className="error-message">{photoError}</div>}
          </div>

          <div className="add-form-group-inline">
            <div className="add-form-group">
              <label htmlFor="pet-name">Nome do Pet: *</label>
              <input
                type="text"
                id="pet-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="color">Cor: *</label>
              <input
                type="text"
                id="color"
                value={formData.color}
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="birth-date">Data de Nascimento: *</label>
              <input
                type="date"
                id="birth-date"
                value={formData.birth_date}
                onChange={handleBirthDateChange}
                disabled={isUnknownBirthDate}
                required={!isUnknownBirthDate}
              />
              <button
                type="button"
                className="unknown-age"
                onClick={handleUnknownBirthDateToggle}
              >
                {isUnknownBirthDate ? "Marcar como conhecida" : "Não sabe a data de nascimento"}
              </button>
            </div>
          </div>
          <div className="add-form-group-inline">
            <div className="add-form-group">
              <label htmlFor="race">Raça: *</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="race"
                  value={formData.race}
                  onChange={handleRaceFilterChange}
                  required
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
                  <FaSearch />
                </button>
              </div>
            </div>
            <div className="add-form-group">
              <label htmlFor="species">Espécie: *</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="species"
                  value={formData.specie}
                  onChange={handleSpecieFilterChange}
                  required
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
                  <FaSearch />
                </button>
              </div>
            </div>
            <div className="add-form-group">
              <div className="switch-container">
                <label htmlFor="is-neutered">É castrado? *</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="is-neutered"
                    checked={formData.is_castrated}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_castrated: e.target.checked }))}
                  />
                  <span className="slider round"></span>
                </label>
                <span>{formData.is_castrated ? "Sim" : "Não"}</span>
              </div>
            </div>
          </div>
        </fieldset>
        <div className="add-form-group">
          <button type="submit" className="create-pet">
            Criar pet
          </button>
        </div>
      </form>

      {isRaceModalOpen && (
        <ModalRace
          isOpen={isRaceModalOpen}
          onClose={() => setIsRaceModalOpen(false)}
          onSave={(selectedRace) =>
            setFormData((prev) => ({
              ...prev,
              race: selectedRace.description,
              race_id: selectedRace.id,
            }))
          }
        />
      )}
      {isSpecieModalOpen && (
        <ModalSpecie
          isOpen={isSpecieModalOpen}
          onClose={() => setIsSpecieModalOpen(false)}
          onSave={(selectedSpecie) =>
            setFormData((prev) => ({
              ...prev,
              specie: selectedSpecie.description,
              specie_id: selectedSpecie.id,
            }))
          }
        />
      )}
    </div>
  );
}

export default AddPet;