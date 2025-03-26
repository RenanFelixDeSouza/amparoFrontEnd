/**
 * Componente UserManager
 * Gerencia navegação entre criação de admin/professor
 */

import React, { useState } from 'react';
import AddProfessor from '../AddProfessor/AddProfessor'; 
import AddAdmin from '../AddAdmin/AddAdmin'; 
import './UserManagement.css';  

function UserManagement() {
  const [activeTab, setActiveTab] = useState('professor');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="list-containet-tab">
      <div className="tab">
        <button
          className={`tab-button ${activeTab === 'professor' ? 'active' : ''}`}
          onClick={() => handleTabChange('professor')}
        >
          Criar Professor
        </button>
        <button
          className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => handleTabChange('admin')}
        >
          Criar Administrador
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'professor' && <AddProfessor />}
        {activeTab === 'admin' && <AddAdmin />}
      </div>
    </div>
  );
}

export default UserManagement;
