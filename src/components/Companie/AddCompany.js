import React, { useState, useCallback } from "react";
import { FaBuilding, FaSearch } from "react-icons/fa";
import api from "../../services/api";
import "../Pet/AddPet/AddPet.css";
import "./AddCompany.css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

function AddCompany() {
  const [formData, setFormData] = useState({
    company_name: "",
    fantasy_name: "",
    cnpj: "",
    ie: "",
    im: "",
    email: "",
    phone: "",
    responsible_name: "",
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    district_name: "",
    city: "",
    state: "",
    city_id: null,
    imExempt: false,
    ieStatus: "Contribuinte",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [cityError, setCityError] = useState("");
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, number: value });
  };

  const handleCnpjChange = (e) => {
    setFormData({ ...formData, cnpj: e.target.value });
  };

  const fetchCompanyByCnpj = async () => {
    setIsLoading(true);
    const cnpj = formData.cnpj.replace(/\D/g, "");
    if (cnpj.length === 14) {
      try {
        const response = await api.get(`/companies/${cnpj}`);
        if (response.status === 200) {
          const data = response.data;
          if (data && !data.error) {
            if (
              data.situacao === "BAIXADA" ||
              data.situacao === "INAPTA" ||
              data.situacao === "SUSPENSA" ||
              data.situacao === "INATIVA"
            ) {
              setError("A empresa está inativa. Não é possível prosseguir.");
              return;
            }
            setFormData((prevFormData) => ({
              ...prevFormData,
              company_name: data.nome || prevFormData.company_name,
              fantasy_name: data.fantasia || prevFormData.fantasy_name,
              email: data.email || prevFormData.email,
              phone: data.telefone || prevFormData.phone,
              zip_code: data.cep || prevFormData.zip_code,
              street: data.logradouro || prevFormData.street,
              number: data.numero || prevFormData.number,
              complement: data.complemento || prevFormData.complement,
              district_name: data.bairro || prevFormData.district_name,
              city: data.municipio || prevFormData.city,
              state: data.uf || prevFormData.state,
            }));
            setError("");
          } else {
            setError("CNPJ não encontrado.");
          }
        } else {
          setError("Erro ao buscar CNPJ. Verifique sua conexão.");
        }
      } catch (error) {
        console.error("Erro ao buscar CNPJ:", error);
        setError("Erro ao buscar CNPJ. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("CNPJ inválido. Certifique-se de que possui 14 dígitos.");
      setIsLoading(false);
    }
  };

  const fetchCities = useCallback(async (cityFilter) => {
    try {
      const response = await api.get("/city", { params: { name: cityFilter } });
      setFilteredCities(response.data || []);
    } catch (error) {
      setFilteredCities([]);
    }
  }, []);

  const handleCityFilterChange = (e) => {
    const cityFilter = e.target.value;
    setFormData({ ...formData, city: cityFilter, city_id: null });
    setCityError("");
    if (cityFilter.length >= 3) {
      fetchCities(cityFilter);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCitySelect = (city) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      city: `${city.name} - ${city.federative_unit}`,
      city_id: city.id,
    }));
    setFilteredCities([]);
    setCityError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const requiredFields = {
      company_name: "Razão Social",
      fantasy_name: "Nome Fantasia",
      cnpj: "CNPJ",
      email: "Email",
      zip_code: "CEP",
      street: "Rua",
      number: "Número",
      district_name: "Bairro",
      city: "Cidade",
      state: "Estado",
    };

    const missingFields = Object.keys(requiredFields).filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map((field) => requiredFields[field]).join(", ");
      setError(`Por favor, preencha os seguintes campos obrigatórios: ${missingFieldNames}.`);
      return;
    }

    if (!formData.city_id) {
      setCityError("Por favor, clique na cidade selecionada.");
      return;
    }

    try {
      const response = await api.post("/companies/create", formData);
      if (response.status === 201) {
        setSuccess("Empresa criada com sucesso!");
        setFormData({
          company_name: "",
          fantasy_name: "",
          cnpj: "",
          ie: "",
          im: "",
          email: "",
          phone: "",
          responsible_name: "",
          zip_code: "",
          street: "",
          number: "",
          complement: "",
          district_name: "",
          city: "",
          state: "",
          city_id: null,
          imExempt: false,
          ieStatus: "Contribuinte",
        });
      }
    } catch (error) {
      setError("Erro ao criar empresa. Tente novamente.");
    }
  };

  return (
    <div className="add-pet-container">
      <form onSubmit={handleSubmit} className="pet-form">
        <h1 style={{ textAlign: "center" }}>Criar Empresa</h1>
        <p style={{ textAlign: "center" }}>* Campos obrigatórios</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="tabs" style={{ marginBottom: "20px" }}>
          <button type="button"
            className={`tab-button ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab("company")}
          >
            Dados da Empresa
          </button>
          <button type="button"

            className={`tab-button ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab("address")}
          >
            Endereço
          </button>
        </div>

        {activeTab === "company" && (
          <fieldset>
            <legend>
              <FaBuilding /> Dados da Empresa
            </legend>
            <div className="add-form-group">
              <label htmlFor="company_name">Razão Social *</label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="fantasy_name">Nome Fantasia *</label>
              <input
                type="text"
                id="fantasy_name"
                name="fantasy_name"
                value={formData.fantasy_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="cnpj">CNPJ *</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleCnpjChange}
                  required
                />
                <button
                  type="button"
                  onClick={fetchCompanyByCnpj}
                  className="open-modal-button"
                >
                  Buscar CNPJ
                </button>
              </div>
            </div>
            <div className="add-form-group-inline">

              <div className="add-form-group">
                <label htmlFor="ie">Inscrição Estadual</label>

                <input
                  type="text"
                  id="ie"
                  name="ie"
                  value={formData.ie}
                  onChange={handleChange}
                  disabled={formData.ieStatus !== "Contribuinte"}
                />
                <select
                  id="ieStatus"
                  name="ieStatus"
                  className="ie-select"
                  value={formData.ieStatus}
                  onChange={(e) => setFormData({ ...formData, ieStatus: e.target.value, ie: e.target.value === "Contribuinte" ? formData.ie : "" })}
                >
                  <option value="Contribuinte">Contribuinte</option>
                  <option value="Isento">Isento</option>
                  <option value="Não Contribuinte">Não Contribuinte</option>
                </select>
              </div>
              <div className="add-form-group">
                <label htmlFor="im">Inscrição Municipal</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="im"
                    name="im"
                    value={formData.im}
                    onChange={handleChange}
                    disabled={formData.imExempt}
                  />
                </div>
                  <button
                    type="button"
                    className="unknown-age"
                    onClick={() => setFormData({ ...formData, imExempt: !formData.imExempt, im: formData.imExempt ? formData.im : "" })}
                  >
                    {formData.imExempt ? "Remover Isenção" : "Isento"}
                  </button>
              </div>
              <div className="add-form-group">
                <label htmlFor="responsible_name">Nome do Responsável</label>
                <input
                  type="text"
                  id="responsible_name"
                  name="responsible_name"
                  value={formData.responsible_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="add-form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="phone">Telefone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </fieldset>
        )}

        {activeTab === "address" && (
          <fieldset>
            <legend>
              <FaSearch /> Endereço
            </legend>
            <div className="add-form-group">
              <label htmlFor="zip_code">CEP *</label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="street">Rua *</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="number">Número *</label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleNumberChange}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="district_name">Bairro *</label>
              <input
                type="text"
                id="district_name"
                name="district_name"
                value={formData.district_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-form-group">
              <label htmlFor="city">Cidade *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleCityFilterChange}
                required
              />
              {filteredCities.length > 0 && (
                <ul className="add-pet-field-list">
                  {filteredCities.map((city) => (
                    <li key={city.id} onClick={() => handleCitySelect(city)}>
                      {`${city.name} - ${city.federative_unit}`}
                    </li>
                  ))}
                </ul>
              )}
              {cityError && <div className="error-message">{cityError}</div>}
            </div>
          </fieldset>
        )}

        <div className="add-form-group">
          <button type="submit" className="create-pet">
            Criar Empresa
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCompany;