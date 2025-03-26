import React, { useState } from 'react';
import api from '../../../../../services/api';
import './ChangePasswordModal.css';

function ChangePasswordModal({ user, onClose, onPasswordChanged }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setError('As novas senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.put(`/user/${user.id}/change-password`, {
                new_password: newPassword,
                new_password_confirmation: confirmNewPassword,
                admin_password: adminPassword
            });

            if (response.status === 200) {
                onPasswordChanged(user.id); 
                onClose(); 
            } else {
                setError('Erro ao alterar a senha.');
            }
        } catch (error) {
            console.error('Erro ao alterar a senha:', error);
            setError(error.response?.data?.message || 'Erro ao alterar a senha.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Alterar Senha</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="new-password">Nova Senha:</label>
                            <input
                                type="password"
                                id="new-password"
                                name="new_password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-new-password">Confirmar Nova Senha:</label>
                            <input
                                type="password"
                                id="confirm-new-password"
                                name="confirm_new_password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="admin-password">Senha do Administrador:</label>
                            <input
                                type="password"
                                id="admin-password"
                                name="admin_password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="modal-buttons">
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Alterando...' : 'Alterar Senha'}
                            </button>
                            <button type="button" onClick={onClose} disabled={isLoading}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ChangePasswordModal;