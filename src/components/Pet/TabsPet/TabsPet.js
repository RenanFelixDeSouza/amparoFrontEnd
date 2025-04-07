/**
 * Componente TabsPet
 * Gerencia a navegação entre as diferentes visualizações de Pets, raças e especies.
 */

import React, { useState } from 'react';
import ListPet from './ListPet/ListPet';
import ListRace from './ListRace/ListRace';
import ListSpecie from './ListSpecie/ListSpecie';

function TabsPet() {
  const [activeTab, setActiveTab] = useState('ListPet');


  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="list-containet-tab">
        <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'ListPet' ? 'active' : ''}`}
              onClick={() => handleTabChange('ListPet')}
            >
              Pets
            </button>
          <button
            className={`tab-button ${activeTab === 'ListRace' ? 'active' : ''}`}
            onClick={() => handleTabChange('ListRace')}
          >
            Raças
          </button>
          <button
            className={`tab-button ${activeTab === 'ListSpecie' ? 'active' : ''}`}
            onClick={() => handleTabChange('ListSpecie')}
          >
            Espécies
          </button>
        </div>

      <div className="tab-content">
        {activeTab === 'ListPet' &&  <ListPet />}
        {activeTab === 'ListRace' && <ListRace />}
        {activeTab === 'ListSpecie' && <ListSpecie />}
      </div>
    </div>
  );
}

export default TabsPet;