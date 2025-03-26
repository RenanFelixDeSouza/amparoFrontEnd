import React, { useState, useEffect } from 'react';
import api from '../../../../../services/api';
import './RemoveCategoriesModal.css';

function RemoveCategoriesModal({ user, onClose, onSave }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.categories) {
      setSelectedCategories([]);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/user/${user.id}/remove-categories`, {
        category_ids: selectedCategories
      });

      if (response.status === 200) {
        onSave();
        onClose();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao remover oficinas do usuário';
      setError(errorMessage);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Remover Oficinas do Professor</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="categories-list">
            {user.categories && user.categories.length > 0 ? (
              user.categories.map(category => (
                <label key={category.id}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  {category.name}
                </label>
              ))
            ) : (
              <p>Este professor não possui oficinas associadas.</p>
            )}
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || selectedCategories.length === 0}
            >
              {loading ? 'Removendo...' : 'Remover Oficinas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RemoveCategoriesModal;
