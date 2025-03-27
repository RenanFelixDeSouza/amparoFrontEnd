import React, { useState, useEffect } from 'react';
import './EditUser.css';
import api, { staticApi } from '../../../services/api';
import Table from '../../Shared/Table';

function EditUser({ onProfilePhotoUpdate }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    address: '',
    photo: null,
    user_name: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [userActions, setUserActions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user');
        setFormData(response.data);

        if (response.data.photo) {
          setPhotoPreview(`${staticApi.defaults.baseURL}/storage/${response.data.photo}`);
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
        <img
          src={image || "https://placehold.co/600x400"}
          alt="Ação"
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
        />
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
        setIsPhotoChanged(false);
        onProfilePhotoUpdate(response.data.photo_url);
      }
    } catch (error) {
      console.error('Erro ao enviar a foto:', error);
      setError('Erro ao enviar a foto. Tente novamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'photo' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await api.put('/user/update', { 
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        address: formData.address,
        photo: formData.photo,
        user_name: formData.user_name,
      });

      setSuccess('Dados atualizados com sucesso!');
      if (response.data.photo_url) {
        setPhotoPreview(response.data.photo_url);
      }

      onProfilePhotoUpdate(formData.name);
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

  return (
    <div className="edit-user-container">
      <div className="photo-upload-container">
        <img
          src={photoPreview || 'https://via.placeholder.com/100'}
          alt="Preview"
          className="photo-preview"
        />
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
        {isPhotoChanged && (
          <button type="button" onClick={handlePhotoSubmit} className="save-photo-button">
            Salvar Foto
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
        <div
          className={`edit-user-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Minhas Ações
        </div>
      </div>

      <form className="edit-user-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'personal' && (
          <>
            <label htmlFor="name">Nome Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
            />

            <label htmlFor="user_name">Nome de Usuário</label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              placeholder="Digite seu nome de usuário"
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email"
            />

            <label htmlFor="phone">Telefone de Contato</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Digite seu telefone de contato"
            />
          </>
        )}

        {activeTab === 'address' && (
          <>
            <label htmlFor="address">Endereço</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Digite seu endereço completo"
              rows="4"
            />
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