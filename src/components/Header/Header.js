/**
 * Componente Header
 * Exibe informações do usuário e logo no cabeçalho
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import api, { staticApi } from '../../services/api'; 
import { FaUserCircle } from 'react-icons/fa';

function Header({ userName, userType, profilePhoto }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(profilePhoto); 
  const [currentUserName, setCurrentUserName] = useState(userName); 
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
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
    const fetchProfilePhoto = async () => {
      try {
        const response = await api.get('/user'); // Endpoint para buscar dados do usuário
        if (response.data.photo) {
          const photoUrl = `${staticApi.defaults.baseURL}/storage/${response.data.photo}`;
          const img = new Image();
          img.src = photoUrl;
          img.onload = () => {
            setUserPhoto(photoUrl);
            setIsLoading(false); // Define como carregado após a imagem ser carregada
          };
        } else {
          setUserPhoto(null); // Usa o ícone padrão
          setIsLoading(false); // Define como carregado mesmo sem foto
        }
        if (response.data.name) {
          setCurrentUserName(response.data.name); // Atualiza o nome do usuário
        }
      } catch (error) {
        console.error('Erro ao buscar a foto de perfil:', error);
        setIsLoading(false); // Define como carregado em caso de erro
      }
    };

    fetchProfilePhoto();
  }, []);

  useEffect(() => {
    setUserPhoto(profilePhoto); // Atualiza a foto de perfil ao receber uma nova URL
  }, [profilePhoto]);

  if (isLoading) {
    return null; // Não renderiza nada enquanto está carregando
  }

  return (
    <div className="header-user-container" style={{ overflowY: 'hidden' }}>
      <div className="user-info">
        <div className="top-line">
          <span className="user-name">{currentUserName}</span>
          <span className="user-separator">-</span>
          <span className="user-type">{userType}</span>
        </div>
      </div>
      <div className="user-menu" ref={userMenuRef}>
        {userPhoto ? (
          <img
            src={userPhoto}
            alt="Foto de Perfil"
            className="user-icon"
            onClick={toggleUserMenu}
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
        ) : (
          <FaUserCircle
            className="user-icon"
            onClick={toggleUserMenu}
            style={{ width: '50px', height: '50px', cursor: 'pointer' }}
          />
        )}
        {isUserMenuOpen && (
          <ul className="user-menu-dropdown">
            <li>
              <Link
                to="/configuracao-usuario"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Editar Usuário
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Header;