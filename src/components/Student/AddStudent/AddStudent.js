/**
 * Componente AddStudent
 * Gerencia o cadastro de novos alunos com informações pessoais, responsáveis e oficinas
 */

import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import ResponsibleModal from "../Modal/Responsible/ResponsibleModal";
import "./AddStudent.css";
import { FaChalkboardTeacher, FaSearch, FaTools, FaUser } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";

function AddStudent() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState(true);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [responsibles, setResponsibles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [canGoHomeAlone, setCanGoHomeAlone] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(15);
  const [hasDisability, setHasDisability] = useState(false);
  const [disabilityType, setDisabilityType] = useState("");
  const [disabilityReport, setDisabilityReport] = useState(null);
  const [disabilityReportName, setDisabilityReportName] = useState("");
  const [fileError, setFileError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Carrega categorias/oficinas disponíveis
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/index?page=1&limit=99999");
        const sortedCategories = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(sortedCategories);
      } catch (error) {
        console.error("Erro ao buscar Oficina:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevSelectedCategories) => {
      if (prevSelectedCategories.includes(categoryId)) {
        return prevSelectedCategories.filter((id) => id !== categoryId);
      } else {
        return [...prevSelectedCategories, categoryId];
      }
    });
  };

  const handleCepChange = (e) => {
    setZipCode(e.target.value);
  };

  /**
   * Busca endereço por CEP usando API externa
   */
  const fetchAddressByCep = async () => {
    const cep = zipCode.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cep}/json/`
        );
        if (response.ok) {
          const data = await response.json();
          if (!data.erro) {
            setStreet(data.logradouro || "");
            setComplement(data.complemento || "");
            setNeighborhood(data.bairro || "");
            setCity(data.localidade || "");
            setState(data.uf || "");
          } else {
            console.error("CEP não encontrado");
            alert("CEP não encontrado.");
          }
        } else {
          console.error("Erro na requisição");
          alert("Erro ao buscar CEP. Por favor, verifique sua conexão.");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        alert("Erro ao buscar CEP. Por favor, tente novamente.");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;
    if (file && file.type !== "application/pdf") {
      setFileError("Por favor, anexe um arquivo PDF.");
      setDisabilityReport(null);
      setDisabilityReportName("");
    } else if (file && file.size > maxSize) {
      setFileError("O tamanho do arquivo não pode exceder 5MB.");
      setDisabilityReport(null);
      setDisabilityReportName("");
    } else if (file) {
      setFileError("");
      setDisabilityReport(file);
      setDisabilityReportName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setDisabilityReport(null);
    setDisabilityReportName("");
    setFileError("");
  };

  /**
   * Submete formulário de cadastro do aluno
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (responsibles.length === 0) {
      alert("É necessário adicionar pelo menos um responsável!");
      return;
    }

    try {
      // Enviar dados do aluno como JSON
      const studentData = {
        first_name: firstName,
        last_name: lastName,
        birthdate: birthdate,
        gender: gender,
        email: email,
        phone_number: phoneNumber,
        street: street,
        number: number,
        complement: complement,
        neighborhood: neighborhood,
        city: city,
        state: state,
        zip_code: zipCode,
        father_name: fatherName,
        mother_name: motherName,
        can_go_home_alone: canGoHomeAlone,
        category_ids: selectedCategories,
        responsibles: responsibles,
        has_disability: hasDisability,
        disability_type: disabilityType,
      };

      const response = await api.post("/student/create", studentData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const studentId = response.data.id;

      // Enviar arquivo PDF separadamente, se existir
      if (disabilityReport) {
        const formData = new FormData();
        formData.append("pdf_attachment", disabilityReport);

        await api.post(`/student/${studentId}/upload-pdf`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      alert("Aluno criado com sucesso!");
      const storedStudents = JSON.parse(localStorage.getItem("studentsData")) || [];
      const updatedStudents = [...storedStudents, studentData];
      localStorage.setItem("studentsData", JSON.stringify(updatedStudents));

      // Reset form fields
      setFirstName("");
      setLastName("");
      setBirthdate("");
      setGender(true);
      setEmail("");
      setPhoneNumber("");
      setStreet("");
      setNumber("");
      setComplement("");
      setNeighborhood("");
      setCity("");
      setState("");
      setZipCode("");
      setFatherName("");
      setMotherName("");
      setCanGoHomeAlone(false);
      setResponsibles([]);
      setHasDisability(false);
      setDisabilityType("");
      setDisabilityReport(null);
      setDisabilityReportName("");
      setCategories([]);
      setSelectedCategories([]);

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      alert("Erro ao criar aluno!");
    }
  };

  const handleEditResponsible = (index) => {
    setShowModal({ show: true, responsibleIndex: index });
  };

  const handleAddResponsibleClick = () => {
    setShowModal({ show: true });
  };

  const handleRemoveResponsible = (index) => {
    setResponsibles(responsibles.filter((_, i) => i !== index));
  };

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(categories.length / categoriesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(categories.length / categoriesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="add-student-container">
      <form onSubmit={handleSubmit} className="student-form">
        <h1 style={{ textAlign: 'center' }}>Criar Aluno</h1>
        <p style={{ textAlign: 'center' }}>* Campos obrigatórios</p>
        <fieldset>
          <legend>
            <FaUser /> Dados pessoais
          </legend>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="first-name">Nome: *</label>
              <input
                type="text"
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last-name">Sobrenome: *</label>
              <input
                type="text"
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="birthdate">Data de Nascimento: *</label>
              <input
                type="date"
                id="birthdate"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="gender">Gênero: *</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value === "true")}
                required
              >
                <option value={true}>Masculino</option>
                <option value={false}>Feminino</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail: *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Número de Telefone: *</label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="mother-name">Nome da Mãe: *</label>
              <input
                type="text"
                id="mother-name"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="father-name">Nome do Pai:</label>
              <input
                type="text"
                id="father-name"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="student-color:black;">
            <FaHouse /> Endereço:
          </legend>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="zip-code">CEP: *</label>
              <div className="cep-input-group">
                <input
                  type="text"
                  id="zip-code"
                  value={zipCode}
                  onChange={handleCepChange}
                  required
                />
                <button type="button" onClick={fetchAddressByCep}>
                  <FaSearch />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="street">Rua: *</label>
              <input
                type="text"
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="number">Número: *</label>
              <input
                type="text"
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="complement">Complemento:</label>
              <input
                type="text"
                id="complement"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="neighborhood">Bairro: *</label>
              <input
                type="text"
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">Cidade: *</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">Estado: *</label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <FaChalkboardTeacher /> Informações Adicionais
          </legend>
          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="has-disability">PCD?</label>
              <select
                id="has-disability"
                value={hasDisability}
                onChange={(e) => setHasDisability(e.target.value === "true")}
              >
                <option value={false}>Não</option>
                <option value={true}>Sim</option>
              </select>
            </div>
            {hasDisability && (
              <>
                <div className="form-group">
                  <label htmlFor="disability-type">Informe o PCD:</label>
                  <input
                    type="text"
                    id="disability-type"
                    value={disabilityType}
                    onChange={(e) => setDisabilityType(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="disability-report" style={{ marginLeft: '20px' }}>Anexar Laudo:</label>
                  <input
                    className="student-file-input"
                    type="file"
                    id="disability-report"
                    onChange={handleFileChange}
                    accept="application/pdf"
                  />
                  <label htmlFor="disability-report" className="file-label">
                    Escolher arquivo
                  </label>
                  {disabilityReportName && (
                    <div className="student-file-info">
                      <p className="student-file-name"> {disabilityReportName}</p>
                      <button type="button" className="student-remove-file" onClick={handleRemoveFile}>
                        Remover Laudo
                      </button>
                    </div>
                  )}
                  {fileError && (
                    <p className="student-file-error">{fileError}</p>
                  )}
                </div>
              </>
            )}

          </div>
          <div className="student-category-checkbox-group">
            <label htmlFor="can-go-home-alone">
              <input
                type="checkbox"
                id="can-go-home-alone"
                checked={canGoHomeAlone}
                onChange={(e) => setCanGoHomeAlone(e.target.checked)}
              />
              Pode ir para casa sozinho?
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend> <FaTools />  Oficinas</legend>
          <div className="form-group">
            <label>Pesquisar Oficinas:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome da oficina"
            />
          </div>
          <div className="form-group">
            <label>Oficinas:</label>
            <div className="category-checkbox-group">
              {currentCategories.map((category) => (
                <div key={category.id} className="category-checkbox-item">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    name="category"
                    value={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                  />
                  <label htmlFor={`category-${category.id}`}>{category.name}</label>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button type="button" onClick={handlePreviousPage} className="student-page-link">
                Anterior
              </button>
              <span className="student-page-info">
                Página {currentPage} / {Math.ceil(filteredCategories.length / categoriesPerPage)}
              </span>
              <button type="button" onClick={handleNextPage} className="student-page-link">
                Próxima
              </button>
            </div>
          </div>
        </fieldset>

        <button
          type="button"
          className="add-responsible"
          onClick={handleAddResponsibleClick}
        >
          Adicionar Responsável
        </button>
        <div className="sudent-form">

          {responsibles.length > 0 && (
            <div className="responsibles-list">
              <h2>Responsáveis:</h2>
              <ul>
                {responsibles.map((responsible, index) => (
                  <li key={index}>
                    {responsible.first_name} {responsible.last_name} -{" "}
                    {responsible.email}
                    <div className="responsible-actions">
                      <button
                        type="button"
                        onClick={() => handleEditResponsible(index)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveResponsible(index)}
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
        <div className="form-group">
          <button type="submit" className="create-student">
            Criar Aluno
          </button>
        </div>
      </form>

      {showModal && (
        <ResponsibleModal
          setShowModal={setShowModal}
          setResponsibles={setResponsibles}
          responsibles={responsibles}
          responsibleIndex={showModal.responsibleIndex}
        />
      )}
    </div>
  );
}

export default AddStudent;