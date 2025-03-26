/**
 * Componente Sidebar
 * Menu lateral responsivo com navegação e controle de acesso baseado em perfil
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaClipboardList,
  FaPlus,
  FaUsers,
  FaSignOutAlt,
  FaClipboardCheck,
  FaUserFriends,
  FaUserCircle,
  FaChartPie,
  FaBell,
  FaFileAlt,
} from 'react-icons/fa';
import './SideBar.css';
import Cookies from 'js-cookie';

function Sidebar({ isOpen, toggleSidebar, setIsLoggedIn, userType, onMouseEnter, onMouseLeave, hasRequests }) {
  const [openSubmenu, setOpenSubmenu] = useState({});
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  /**
   * Controla abertura/fechamento de submenus
   */
  const handleSubmenuToggle = (menu) => {
    setOpenSubmenu((prev) => {
      if (prev[menu]) {
        return { ...prev, [menu]: false };
      }

      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      return { ...newState, [menu]: true };
    });
  };

  /**
   * Realiza logout do usuário
   */
  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userType');
    Cookies.remove('userName');
    localStorage.removeItem('token');
    localStorage.removeItem('studentsData');
    setIsLoggedIn(false);
    toggleSidebar();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar();
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, toggleSidebar]);

  useEffect(() => {
    if (!isOpen) {
      setOpenSubmenu({});
    }
  }, [isOpen]);

  return (
    <div
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      ref={sidebarRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="sidebar-header">
        {isOpen && (
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            <Link to="/dashboard" className="sidebar-logo">
              <img src="/logo-amparoserver.png" alt="logo" width={'60px'} />
            </Link>
          </div>
        )}
        <Link to="/dashboard" className="sidebar-logo">{isOpen ? 'Gestão' : 'amparoserver'}</Link>
      </div>

      <div className="sidebar-content">

        {userType === 'master' && (
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <Link to="/dashboard" className="sidebar-link">
                <FaChartPie /> <span>Dashboard</span>
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/solicitacoes" className={`sidebar-link ${hasRequests ? 'has-requests' : ''}`}>
                <FaBell className={`bell-icon ${hasRequests ? 'bell-animation' : ''}`} />
                <span>Solicitações</span>
                {hasRequests && <div className="notification-dot"></div>}
              </Link>
            </li>

            <li className="sidebar-item">
              <div className="sidebar-link" onClick={() => handleSubmenuToggle('oficinas')}>
                <FaClipboardList /> <span>Oficinas</span>
              </div>
              <ul className={`sidebar-submenu ${openSubmenu.oficinas ? 'open' : ''}`}>
                <li><Link to="/listar-oficinas"><FaClipboardList /> <span>Lista de Oficinas</span></Link></li>
                <li><Link to="/criar-oficina"><FaPlus /> <span>Criar nova Oficina</span></Link></li>
              </ul>
            </li>

            <li className="sidebar-item">
              <div className="sidebar-link" onClick={() => handleSubmenuToggle('turmas')}>
                <FaUserFriends /> <span>Turmas</span>
              </div>
              <ul className={`sidebar-submenu ${openSubmenu.turmas ? 'open' : ''}`}>
                <li><Link to="/listar-turmas"><FaUserFriends /> <span>Listar turmas</span></Link></li>
                <li><Link to="/adicionar-turma"><FaPlus /> <span>Adicionar turma</span></Link></li>
              </ul>
            </li>

            <li className="sidebar-item">
              <div className="sidebar-link" onClick={() => handleSubmenuToggle('alunos')}>
                <FaUsers /> <span>Alunos</span>
              </div>
              <ul className={`sidebar-submenu ${openSubmenu.alunos ? 'open' : ''}`}>
                <li><Link to="/alunos"><FaUsers /> <span>Lista de Alunos</span></Link></li>
                <li><Link to="/adicionar-aluno"><FaPlus /> <span>Criar Aluno</span></Link></li>
              </ul>
            </li>

            <li className="sidebar-item">
              <Link to="/relatorios" className="sidebar-link">
                <FaFileAlt /> <span>Relatórios</span>
              </Link>
            </li>
          </ul>
        )}
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <Link to="/chamadas" className="sidebar-link">
              <FaClipboardCheck /> <span>Chamadas / Planejmanento</span>
            </Link>
          </li>


        </ul>

      </div>



      <div className="sidebar-footer">
        {userType === 'master' && (
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <div className="sidebar-link" onClick={() => handleSubmenuToggle('usuario')}>
                <FaUserCircle /> <span>Usuário</span>
              </div>
              <ul className={`sidebar-submenu ${openSubmenu.usuario ? 'open' : ''}`}>
                <li><Link to="/listar-usuarios"><FaUserCircle /> <span>Listar Usuário</span></Link></li>
                <li><Link to="/adicionar-usuario"><FaPlus /> <span>Adicionar Usuário</span></Link></li>
              </ul>
            </li>
          </ul>
        )}

        <div className="sidebar-link" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Logout</span>
        </div>
      </div>
    </div >
  );
}

export default Sidebar;
