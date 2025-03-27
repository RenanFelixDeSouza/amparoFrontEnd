/**
 * Componente Header
 * Exibe informações do usuário e logo no cabeçalho
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import api, { staticApi } from '../../services/api'; // Importa a instância para URLs estáticas

function Header({ userName, userType, profilePhoto, onProfilePhotoUpdate }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(profilePhoto || 'https://placehold.co/600x400'); // Estado para a foto de perfil
  const [currentUserName, setCurrentUserName] = useState(userName); // Estado para o nome do usuário
  const userMenuRef = useRef(null);

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const closeUserMenu = (e) => {
    if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
      setIsUserMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeUserMenu);
    return () => {
      document.removeEventListener('click', closeUserMenu);
    };
  }, []);

  useEffect(() => {
    onProfilePhotoUpdate(profilePhoto);
  }, [profilePhoto, onProfilePhotoUpdate]);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const response = await api.get('/user'); // Endpoint para buscar dados do usuário
        if (response.data.photo) {
          setUserPhoto(`${staticApi.defaults.baseURL}/storage/${response.data.photo}`);
          onProfilePhotoUpdate(response.data.photo_url);
        }
        if (response.data.name) {
          setCurrentUserName(response.data.name); // Atualiza o nome do usuário
        }
      } catch (error) {
        console.error('Erro ao buscar a foto de perfil:', error);
      }
    };

    fetchProfilePhoto();
  }, [onProfilePhotoUpdate]);

  useEffect(() => {
    if (userName) {
      setCurrentUserName(userName); // Atualiza o nome do usuário dinamicamente
    }
  }, [userName]);

  return (
    <div className="header-user-container" style={{overflowY: 'hidden'}}>
      <div className="user-info">
        <div className="top-line">
          <span className="user-name">{currentUserName}</span>
          <span className="user-separator">-</span>
          <span className="user-type">{userType}</span>
        </div>
      </div>
      <div className="user-menu" ref={userMenuRef}>
        <img
          src={userPhoto}
          alt="Foto de Perfil"
          className="user-icon"
          onClick={toggleUserMenu}
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        />
        {isUserMenuOpen && (
          <ul className="user-menu-dropdown">
            <li>
              <Link to="/configuracao-usuario">Editar Usuário</Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Header;