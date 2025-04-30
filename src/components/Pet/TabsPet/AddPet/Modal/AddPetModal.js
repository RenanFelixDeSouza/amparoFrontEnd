import React, { useState } from "react";
import api from "../../services/api";

function AddPetModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    race: "",
    specie: "",
    race_id: "",
    specie_id: "",
    photo: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [filteredSpecies, setFilteredSpecies] = useState([]);
  const [raceError, setRaceError] = useState("");
  const [specieError, setSpecieError] = useState("");

  const handleRaceSelect = (race) => {
    setFormData((prev) => ({
      ...prev,
      race: race.description,
      race_id: race.id,
    }));
    setFilteredRaces([]);
    setRaceError("");
  };

  const handleSpecieSelect = (specie) => {
    setFormData((prev) => ({
      ...prev,
      specie: specie.description,
      specie_id: specie.id,
    }));
    setFilteredSpecies([]);
    setSpecieError("");
  };

  const handlePhotoSubmit = async (petId) => {
    const formDataPhoto = new FormData();
    formDataPhoto.append("photo", formData.photo);

    try {
      await api.post(`/pets/${petId}/photo`, formDataPhoto, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Erro ao enviar a foto:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = { ...formData };
      delete data.photo;
      
      // Garantindo que os IDs sejam enviados corretamente
      const requestData = {
        name: data.name,
        specie: data.specie_id,
        race: data.race_id,
        birth_date: data.birth_date,
        is_castrated: data.is_castrated ? 1 : 0
      };

      const response = await api.post("/pets", requestData);
      setSuccess("Pet cadastrado com sucesso!");
      if (formData.photo) {
        await handlePhotoSubmit(response.data.id);
      }
      onSave();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Erro ao cadastrar o pet. Tente novamente.");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Idade"
          value={formData.age}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, age: e.target.value }))
          }
        />
        <input
          type="number"
          placeholder="Peso"
          value={formData.weight}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, weight: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Raça"
          value={formData.race}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, race: e.target.value }))
          }
        />
        <input
          type="text"
          placeholder="Espécie"
          value={formData.specie}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, specie: e.target.value }))
          }
        />
        <input
          type="file"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, photo: e.target.files[0] }))
          }
        />
        <button type="submit">Salvar</button>
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default AddPetModal;