import React, { useState, useEffect, useCallback } from 'react';
import './EditUser.css';
import api, { staticApi } from '../../../services/api';
import Table from '../../Shared/Table';
import { FaUserCircle, FaSearch } from 'react-icons/fa';

function EditUser({ onProfilePhotoUpdate }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    photo: null,
    user_name: '',
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    district_name: '',
    city: '',
    state: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [userActions, setUserActions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [cityError, setCityError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user');
        const userData = response.data?.user;
        const addressData = response.data?.user?.address;

        console.log(response, 'dados responde');

        setFormData({
          name: userData?.name || '',
          email: userData?.email || '',
          phone: userData?.phone || '',
          address: userData?.address || '',
          photo: userData?.photo_url || null,
          user_name: userData?.user_name || '',
          zip_code: addressData?.zip_code || '',
          street: addressData?.street || '',
          number: addressData?.number || '',
          complement: addressData?.complement || '',
          district_name: addressData?.district_name || '',
          city: addressData
            ? `${addressData.city_name} - ${addressData.city_federative_unit}`
            : '',
          city_id: addressData?.city_id || null,
          state: addressData?.city_federative_unit || '',
        });

        if (userData.photo_url) {
          setPhotoPreview(userData.photo_url);
        } else if (userData.photo && userData.photo !== "") {
          setPhotoPreview(`${staticApi.defaults.baseURL}/storage/${userData.photo}`);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setError('Erro ao carregar dados do usuário.');
      }
    };

    const fetchUserActions = async () => {
      const actions = [
        { id: 1, type: 'Cadastro', description: 'Cachorro cadastrado: Rex', date: '2023-10-01' },
        { id: 2, type: 'Doação', description: 'Doou ração para abrigo', date: '2023-10-05' },
        { id: 3, type: 'Adoção', description: 'Adotou cachorro: Max', date: '2023-10-10' },
      ];
      setUserActions(actions);
    };

    fetchUserData();
    fetchUserActions();
  }, []);

  const columns = [
    {
      key: 'image',
      label: 'Imagem',
      render: (image) => (
        image ? (
          <img
            src={image}
            alt="Ação"
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
          />
        ) : (
          <FaUserCircle size={50} color="#ccc" />
        )
      ),
    },
    { key: 'type', label: 'Tipo' },
    { key: 'description', label: 'Descrição' },
    { key: 'date', label: 'Data' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCepChange = (e) => {
    setFormData({ ...formData, zip_code: e.target.value });
  };

  const fetchAddressByCep = async () => {
    const cep = formData.zip_code.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (!data.erro) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              street: data.logradouro || prevFormData.street,
              complement: data.complemento || prevFormData.complement,
              district_name: data.bairro || prevFormData.district_name,
              city: data.localidade || prevFormData.city,
              state: data.uf || prevFormData.state,
            }));

            if (data.localidade) {
              const cityResponse = await api.get('/city', { params: { name: data.localidade } });
              const cities = cityResponse.data || [];
              setFilteredCities(cities);

              if (cities.length === 1) {
                handleCitySelect(cities[0]);
              }
            }
          } else {
            setError("CEP não encontrado.");
          }
        } else {
          setError("Erro ao buscar CEP. Verifique sua conexão.");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        setError("Erro ao buscar CEP. Tente novamente.");
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'image/png') {
        setError('Apenas imagens no formato PNG são permitidas.');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setError('O tamanho da imagem deve ser menor que 2MB.');
        return;
      }

      setError('');
      setFormData({ ...formData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
      setIsPhotoChanged(true);
    }
  };

  const handlePhotoSubmit = async () => {
    setError('');
    setSuccess('');

    if (!formData.photo) {
      setError('Nenhuma foto selecionada.');
      return;
    }

    try {
      const photoData = new FormData();
      photoData.append('photo', formData.photo);

      const response = await api.post('/user/upload-photo', photoData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Foto enviada com sucesso!');
      if (response.data.photo_url) {
        setPhotoPreview(response.data.photo_url);
        onProfilePhotoUpdate(response.data.photo_url);
      }
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar a foto:', error);
      setError('Erro ao enviar a foto. Tente novamente.');
    }
  };

  const handlePhotoDelete = () => {
    setError('');
    setSuccess('');

    if (!formData.photo) {
      setError('Nenhuma foto selecionada.');
      return;
    }
    try {
      api.delete('/user/delete-photo');
      setSuccess('Foto removida com sucesso!');
      onProfilePhotoUpdate("");
    } catch (error) {
      console.error('Erro ao remover a foto:', error);
      setError('Erro ao remover a foto. Tente novamente.');
    }
    setIsPhotoChanged(false);
    setPhotoPreview(false);
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validação de campos obrigatórios
    const requiredFields = {
      name: 'Nome Completo',
      email: 'Email',
      phone: 'Telefone de Contato',
      user_name: 'Nome de Usuário',
      zip_code: 'CEP',
      street: 'Rua',
      number: 'Número',
      district_name: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
    };

    const missingFields = Object.keys(requiredFields).filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map((field) => requiredFields[field]).join(', ');
      setError(`Por favor, preencha os seguintes campos obrigatórios: ${missingFieldNames}.`);
      return;
    }

    // Valida se o usuário clicou na cidade selecionada
    if (!formData.city_id) {
      setCityError('Por favor, clique na cidade selecionada.');
      return;
    }

    try {
      const formDataToSend = {
        ...formData,
        city: undefined,
        city_id: formData.city_id,
      };

      delete formDataToSend.photo;


      await api.put('/user/update', formDataToSend);

      setSuccess('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      if (error.response && error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(' ');
        setError(errorMessages);
      } else {
        setError('Erro ao atualizar dados. Tente novamente.');
      }
    }
  };

  const getActionItems = (itemId, item) => {
    return [
      {
        label: 'Ver Detalhes',
        action: () => {
          console.log(`Abrindo detalhes para a ação: ${itemId}`, item);
        },
      },
    ];
  };

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchCities = useCallback(async (cityFilter) => {
    try {
      console.log("Buscando cidades com filtro:", cityFilter);
      const response = await api.get('/city', { params: { name: cityFilter } });
      setFilteredCities(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      setFilteredCities([]);
    }
  }, []);

  const debouncedFetchCities = useCallback((cityFilter) => {
    const debouncedFunction = debounce((filter) => {
      fetchCities(filter);
    }, 500);
    debouncedFunction(cityFilter);
  }, [fetchCities]);

  const handleCityFilterChange = (e) => {
    const cityFilter = e.target.value;
    setFormData({ ...formData, city: cityFilter, city_id: null });
    setCityError('');
    if (cityFilter.length >= 3) {
      debouncedFetchCities(cityFilter); // Agora o valor correto será passado
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
    setCityError('');
  };

  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, number: value });
  };

  return (
    <div className="edit-user-container">
      <div className="photo-upload-container">
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Preview"
            className="photo-preview"
          />
        ) : (
          <FaUserCircle size={100} color="#ccc" />
        )}
        <label htmlFor="photo-upload" className="photo-upload-label">
          Alterar Foto
        </label>
        <input
          type="file"
          id="photo-upload"
          className="photo-upload-input"
          accept="image/png"
          onChange={handlePhotoChange}
        />
        {isPhotoChanged && photoPreview && (
          <button type="button" onClick={handlePhotoSubmit} className="save-photo-button">
            Salvar Foto
          </button>
        )}
        {photoPreview && photoPreview && (
          <button type="button" onClick={() => handlePhotoDelete()} className="remove-photo-button">
            Remover Foto
          </button>
        )}
      </div>

      <div className="edit-user-tabs">
        <div
          className={`edit-user-tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Dados Pessoais
        </div>
        <div
          className={`edit-user-tab ${activeTab === 'address' ? 'active' : ''}`}
          onClick={() => setActiveTab('address')}
        >
          Endereço
        </div>
        {/* <div
          className={`edit-user-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Minhas Ações
        </div> */}
      </div>

      <form className="edit-user-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'personal' && (
          <>
            <div className="form-group-personal-inline">
              <div className="form-group-personal">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="form-group-personal">
                <label htmlFor="user_name">Nome de Usuário</label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  placeholder="Digite seu nome de usuário"
                />
              </div>
            </div>

            <div className="form-group-personal-inline">
              <div className="form-group-personal">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Digite seu email"
                />
              </div>

              <div className="form-group-personal">
                <label htmlFor="phone">Telefone de Contato</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Digite seu telefone de contato"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'address' && (
          <>
            <div className="form-group-address-inline">
              <div className="form-group-address">
                <label htmlFor="zip_code">CEP</label>
                <div className="cep-input-group">
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleCepChange}
                    placeholder="Digite seu CEP"
                  />
                  <button type="button" onClick={fetchAddressByCep} className="cep-search-button">
                    <FaSearch />
                  </button>
                </div>
              </div>

              <div className="form-group-address">
                <label htmlFor="street">Rua</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Digite sua rua"
                />
              </div>

              <div className="form-group-address">
                <label htmlFor="number">Número</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleNumberChange}
                  placeholder="Digite o número"
                />
              </div>
            </div>

            <div className="form-group-address-inline">
              <div className="form-group-address">
                <label htmlFor="complement">Complemento</label>
                <input
                  type="text"
                  id="complement"
                  name="complement"
                  value={formData.complement}
                  onChange={handleChange}
                  placeholder="Digite o complemento"
                />
              </div>

              <div className="form-group-address">
                <label htmlFor="district_name">Bairro</label>
                <input
                  type="text"
                  id="district_name"
                  name="district_name"
                  value={formData.district_name}
                  onChange={handleChange}
                  placeholder="Digite seu bairro"
                />
              </div>

              <div className="form-group-address">
                <label htmlFor="city">Cidade</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleCityFilterChange}
                  placeholder="Digite sua cidade"
                />
                {filteredCities.length > 0 && (
                  <ul className="city-list">
                    {filteredCities.map((city) => (
                      <li key={city.id} onClick={() => handleCitySelect(city)}>
                        {`${city.name} - ${city.federative_unit}`}
                      </li>
                    ))}
                  </ul>
                )}
                {cityError && <div className="error-message">{cityError}</div>}
              </div>
            </div>
          </>
        )}

        {activeTab === 'actions' && (
          <Table
            data={userActions}
            columns={columns}
            itemsPerPage={5}
            isSortable={true}
            handleSort={() => { }}
            getActionItems={getActionItems}
          />
        )}

        {activeTab !== 'actions' && <button type="submit">Salvar Alterações</button>}
      </form>
    </div>
  );
}

export default EditUser;