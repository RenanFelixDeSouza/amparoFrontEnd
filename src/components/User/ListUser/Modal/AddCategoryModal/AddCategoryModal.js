/**
 * Componente AddCategoryModal
 * Modal para vincular oficinas a um professor
 */

import React, { useState, useEffect } from 'react';
import api from '../../../../../services/api';
import './AddCategoryModal.css';

function AddCategoryModal({ user, onClose, onSave }) {
    const [availableCategories, setAvailableCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [existingCategories, setExistingCategories] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12,
    });

    /**
     * Busca categorias disponíveis
     */
    useEffect(() => {
        // Inicializa as categorias existentes do usuário
        if (user && user.categories) {
            setExistingCategories(user.categories.map(cat => cat.id));
        }

        const fetchCategories = async () => {
            try {
                const response = await api.get(`/categories/index?page=1&limit=999999`);
                setAvailableCategories(response.data.data || []);
            } catch (error) {
                console.error('Erro ao buscar oficinas:', error);
                alert('Erro ao carregar oficinas disponíveis');
            }
        };
        fetchCategories();
    }, [user]);

    const handleCategorySelection = (categoryId) => {
        // Não permite seleção se a categoria já está vinculada
        if (existingCategories.includes(categoryId)) {
            return;
        }

        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            }
            return [...prev, categoryId];
        });
    };

    /**
     * Salva categorias selecionadas
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/professors/${user.id}/categories`, {
                category_ids: selectedCategories
            });
            alert('Oficinas vinculadas com sucesso!');
            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao vincular oficinas:', error);
            alert('Erro ao vincular oficinas');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({
            ...prev,
            currentPage: 1 // Reset para página 1 quando pesquisar
        }));
    };

    const paginateData = (data) => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const filteredCategories = availableCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / pagination.itemsPerPage);
    const paginatedCategories = paginateData(filteredCategories);

    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            totalPages: totalPages,
            totalItems: filteredCategories.length
        }));
    }, [filteredCategories, totalPages]);

    return (
        <div className="modal-overlay">
            <div className="modal-contentl" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <h2>Adicionar Oficinas para {user.name}</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Pesquisar oficinas..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="categories-grid">
                            {paginatedCategories.map(category => (
                                <div key={category.id} className="category-grid-item">
                                    <label className={existingCategories.includes(category.id) ? 'disabled' : ''}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category.id) || existingCategories.includes(category.id)}
                                            onChange={() => handleCategorySelection(category.id)}
                                            disabled={existingCategories.includes(category.id)}
                                        />
                                        <span className="category-name">
                                            {category.name}
                                            {existingCategories.includes(category.id) && ' (Já vinculada)'}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="pagination">
                            <button  type='button' onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1}>{"<<"}</button>
                            <button type='button' onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>{"<"}</button>
                            <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
                            <button type='button' onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === totalPages}>{">"}</button>
                            <button type='button' onClick={() => handlePageChange(totalPages)} disabled={pagination.currentPage === totalPages}>{">>"}</button>
                        </div>

                        <div className="modal-buttons">
                            <button type="submit" disabled={loading || selectedCategories.length === 0}>
                                {loading ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button type="button" onClick={onClose}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddCategoryModal;
