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
  const [petName, setPetName] = useState("");
  const [color, setColor] = useState("");
  const [age, setAge] = useState("");
  const [race, setrace] = useState("");
  const [species, setSpecies] = useState("");
  const [isCastrated, setisCastrated] = useState(false);
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
    setAge(e.target.value);
  };

  /**
   * Alterna o estado de "Não sabe a data de nascimento".
   */
  const handleUnknownBirthDateToggle = () => {
    setIsUnknownBirthDate((prev) => !prev);
    if (!isUnknownBirthDate) {
      setAge(""); // Limpa o campo de data se for marcado como desconhecido
    }
  };

  /**
   * Submete os dados do formulário para criar um novo pet.
   * Inclui validações e envio de dados para a API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!petName || !color || (!age && !isUnknownBirthDate) || !race || !species) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const petData = {
        name: petName,
        color: color,
        birth_date: age,
        race_id: race.id,
        specie_id: species.id,
        is_castrated: isCastrated ? 1 : 0,
      };

      const response = await api.post("/pets/create", petData);

      if (response.status === 201) {
        const petId = response.data.pet.id;

        if (photo) {
          try {
            const formData = new FormData();
            formData.append("photo", photo);

            const photoResponse = await api.post(`/pets/${petId}/upload-photo`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            if (photoResponse.status === 200) {
              setSuccessMessage("Pet e foto criados com sucesso!");
            } else {
              setSuccessMessage("Pet criado, mas houve um problema ao salvar a foto.");
            }
          } catch {
            setSuccessMessage("Pet criado, mas houve um problema ao salvar a foto.");
          }
        } else {
          setSuccessMessage("Pet criado com sucesso!");
        }

        resetForm();
      } else {
        setErrorMessage("Erro ao criar pet. Por favor, tente novamente.");
      }
    } catch {
      setErrorMessage("Erro ao criar pet. Por favor, tente novamente.");
    } finally {
      setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 5000);
    }
  };

  /**
   * Reseta os campos do formulário.
   */
  const resetForm = () => {
    setPetName("");
    setColor("");
    setAge("");
    setrace("");
    setSpecies("");
    setisCastrated(false);
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError("");
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
    setrace((prev) => ({ ...prev, id: "", description: raceFilter }));
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
    setrace(race);
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
    setSpecies((prev) => ({ ...prev, id: "", description: specieFilter }));
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
    setSpecies(specie);
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
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="color">Cor: *</label>
              <input
                type="text"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="birth-date">Data de Nascimento: *</label>
              <input
                type="date"
                id="birth-date"
                value={age}
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
                  value={race.description || ""}
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
                  value={species.description || ""}
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
                    checked={isCastrated}
                    onChange={(e) => setisCastrated(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
                <span>{isCastrated ? "Sim" : "Não"}</span>
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
          onSave={(selectedRace) => setrace(selectedRace)}
        />
      )}
      {isSpecieModalOpen && (
        <ModalSpecie
          isOpen={isSpecieModalOpen}
          onClose={() => setIsSpecieModalOpen(false)}
          onSave={(selectedSpecie) => setSpecies(selectedSpecie)}
        />
      )}
    </div>
  );
}

export default AddPet;