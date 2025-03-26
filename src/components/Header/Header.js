/**
 * Componente Header
 * Exibe informações do usuário e logo no cabeçalho
 */

import React from 'react';
import './Header.css';
import logo from '../../img/logo-prefeitura/logomarca-oficial.png';

function Header({ userName, userType, poloName }) {
  return (
    <div className="header-user-container">
      <div className="user-info">
        <div className="top-line">
          <span className="user-name">{userName}</span>
          <span className="user-separator">-</span>
          <span className="user-type">{userType}</span>
        </div>
        <span className="polo-name">{poloName}</span>
      </div>
      <img src={logo} alt="Logo" className="logo" />
    </div>
  );
}

export default Header;