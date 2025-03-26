/**
 * Componente AttendanceList
 * Gerencia a navegação entre as diferentes visualizações de chamada
 */

import React, { useState, useEffect } from 'react';
import ListCourses from '../../Course/ListCourses/ListCourses'; 
import AttendanceRecords from '../AttendanceRecords/AttendanceRecords'; 
import LessonPlan from '../LessonPlan/LessonPlan'; 
import './AttendanceList.css';
import Cookies from 'js-cookie';

function AttendanceList() {
  const [activeTab, setActiveTab] = useState('records');
  const [isMobile, setIsMobile] = useState(false);
  const userType = Cookies.get('userType');

  /**
   * Configura comportamento responsivo
   */
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setActiveTab('records');
      }
    };

    // Se for professor, força a aba de chamadas
    if (userType === 'professor') {
      setActiveTab('records');
    }

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, [userType]);

  const handleTabChange = (tab) => {
    if (isMobile && tab !== 'records') return;
    if (userType === 'professor' && tab === 'courses') return;
    setActiveTab(tab);
  };

  return (
    <div className="list-containet-tab">
      {!isMobile && (
        <div className="tabs">
          {userType === 'admin' && (
            <button
              className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => handleTabChange('courses')}
            >
              turmas
            </button>
          )}
          <button
            className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => handleTabChange('records')}
          >
            Chamadas
          </button>
          <button
            className={`tab-button ${activeTab === 'lessonPlan' ? 'active' : ''}`}
            onClick={() => handleTabChange('lessonPlan')}
          >
            Planejamento
          </button>
        </div>
      )}

      <div className="tab-content">
        {!isMobile && activeTab === 'courses' && userType === 'admin' && <ListCourses />}
        {(isMobile || activeTab === 'records') && <AttendanceRecords />}
        {!isMobile && activeTab === 'lessonPlan' && <LessonPlan />}
      </div>
    </div>
  );
}

export default AttendanceList;