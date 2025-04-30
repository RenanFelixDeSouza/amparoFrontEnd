import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSignOutAlt,
  FaUserCircle,
  FaChartPie,
   FaPaw,
  FaBuilding,
} from 'react-icons/fa';
import './SideBar.css';
import Cookies from 'js-cookie';

/**
 * Componente Sidebar
 * 
 * @param {boolean} isOpen - Indica se a barra lateral está aberta.
 * @param {function} toggleSidebar - Função para alternar o estado da barra lateral.
 * @param {function} setIsLoggedIn - Função para atualizar o estado de login.
 * @param {string} userType - Tipo de usuário (ex.: 'master').
 * @param {function} onMouseEnter - Função chamada ao passar o mouse sobre a barra lateral.
 * @param {function} onMouseLeave - Função chamada ao retirar o mouse da barra lateral.
 * @param {boolean} hasRequests - Indica se há solicitações pendentes.
 */
function Sidebar({ isOpen, toggleSidebar, setIsLoggedIn, userType, onMouseEnter, onMouseLeave, hasRequests }) {
  const [openSubmenu, setOpenSubmenu] = useState({});
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  /**
   * Alterna o estado de um submenu.
   * @param {string} menu - Nome do menu a ser alternado.
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
   * Realiza o logout do usuário, removendo cookies e redirecionando para a página inicial.
   */
  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userType');
    Cookies.remove('userName');
    localStorage.removeItem('token');
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

  useEffect(() => {
    if (!isOpen) {
      setSearchText('');
    }
  }, [isOpen]);

  const synonyms = {
    'criar pet': [
      'adicionar pet',
      'adicionar gato',
      'adicionar cachorro',
      'criar cachorro',
      'criar gato',
      'criar animal',
      'criar bicho',
      'criar animal de estimação',
      'criar animalzinho',
      'criar animal de companhia',
      'registrar pet',
      'registrar animal',
      'registrar cachorro',
      'registrar gato',
      'cadastrar pet',
      'cadastrar animal',
      'cadastrar cachorro',
      'cadastrar gato'
    ],
    'lista de pet': [
      'listar pet',
      'listar gatos',
      'listar cachorros',
      'ver lista de pets',
      'ver lista de animais',
      'consultar pets',
      'consultar animais',
      'consultar gatos',
      'consultar cachorros'
    ],
  };

  /**
   * Verifica se o texto de busca corresponde ao rótulo ou seus sinônimos.
   * @param {string} label - Rótulo do item.
   * @param {string} searchText - Texto de busca.
   * @returns {boolean} - Retorna true se houver correspondência.
   */
  const matchSynonyms = (label, searchText) => {
    const normalizedSearchText = searchText.toLowerCase();
    if (label.toLowerCase().includes(normalizedSearchText)) {
      return true;
    }
    for (const [key, values] of Object.entries(synonyms)) {
      if (key.toLowerCase() === label.toLowerCase() && values.some((syn) => syn.includes(normalizedSearchText))) {
        return true;
      }
    }
    return false;
  };

  /**
   * Filtra os itens do menu com base no texto de busca.
   * @param {Array} items - Lista de itens do menu.
   * @returns {Array} - Lista de itens filtrados.
   */
  const filterMenuItems = (items) => {
    return items
      .map((item) => {
        if (item.submenu) {
          const filteredSubmenu = item.submenu.filter((subItem) =>
            matchSynonyms(subItem.label, searchText)
          );
          if (matchSynonyms(item.label, searchText) || filteredSubmenu.length > 0) {
            return { ...item, submenu: filteredSubmenu };
          }
        } else if (matchSynonyms(item.label, searchText)) {
          return item;
        }
        return null;
      })
      .filter(Boolean);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <FaChartPie />, link: '/dashboard' },
    // { label: 'Solicitações', icon: <FaBell />, link: '/solicitacoes', hasRequests },
    {
      label: 'Pet',
      icon: <FaPaw />,
      submenu: [
        { label: 'Lista de pet', icon: <FaPaw />, link: '/listar-pets' },
        { label: 'Criar Pet', icon: <FaPaw />, link: '/adicionar-pet' },
      ]
    },
    {
      label: 'Empresas',
      icon: <FaBuilding />,
      submenu: [
        { label: 'Lista de Empresas', icon: <FaBuilding />, link: '/listar-empresas' },
        { label: 'Criar Empresa', icon: <FaBuilding />, link: '/adicionar-empresa' },
      ]
    },
    // { label: 'Relatórios', icon: <FaFileAlt />, link: '/relatorios' },
  ];

  const filteredMenuItems = filterMenuItems(menuItems);

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
            <Link to="/dashboard" className="sidebar-logo"></Link>
          </div>
        )}
        <Link to="/dashboard" className="sidebar-logo">{isOpen ? 'Gestão' : 'AA'}</Link>
      </div>

      <div className="sidebar-content">
        {isOpen && (
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        )}

        <ul className="sidebar-menu">
          {filteredMenuItems.map((item, index) => (
            <li key={index} className="sidebar-item">
              {item.submenu ? (
                <>
                  <div className="sidebar-link" onClick={() => handleSubmenuToggle(item.label)}>
                    {item.icon} <span>{item.label}</span>
                  </div>
                  <ul className={`sidebar-submenu ${openSubmenu[item.label] ? 'open' : ''}`}>
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.link}
                          onClick={() => setSearchText('')}
                        >
                          {subItem.icon} <span>{subItem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link
                  to={item.link}
                  className="sidebar-link"
                  onClick={() => setSearchText('')}
                >
                  {item.icon} <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        {userType === 'master' && (
          <>
            <ul className="sidebar-menu">
              <li className="sidebar-item">
                <div className="sidebar-link" onClick={() => handleSubmenuToggle('usuario')}>
                  <FaUserCircle /> <span>Usuário</span>
                </div>
                <ul className={`sidebar-submenu ${openSubmenu.usuario ? 'open' : ''}`}>
                  <li><Link to="/listar-usuarios"><FaUserCircle /> <span>Listar Usuário</span></Link></li>
                </ul>
              </li>
            </ul>
          </>
        )}

        <div className="sidebar-link" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;