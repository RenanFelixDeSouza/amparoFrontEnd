/**
 * Componente CreateCallModal
 * Modal para criar nova chamada para uma turma
 */

import React, { useState } from 'react';
import api from '../../../../services/api';
import { FaTimes } from 'react-icons/fa';

function CreateCallModal({ course, onClose, onSuccess }) {
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('00:00');
    const [selectedDay, setSelectedDay] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const daysOfWeekMapping = {
        1: "Segunda-feira",
        2: "Terça-feira",
        3: "Quarta-feira",
        4: "Quinta-feira",
        5: "Sexta-feira",
        6: "Sábado",
        7: "Domingo",
    };

    const getDayOfWeek = (date) => {
        const day = new Date(date).getUTCDay();
        return day === 0 ? 7 : day; 
    };

    /**
     * Salva nova chamada
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formattedDate = new Date(attendanceDate).toISOString().split('T')[0];
        const dayOfWeek = getDayOfWeek(formattedDate);

        console.log('Data:', formattedDate, 'Dia da semana:', dayOfWeek, 'Dia selecionado:', Number(selectedDay));
        if (dayOfWeek !== Number(selectedDay)) {
            setError('A data inserida não corresponde ao dia da semana escolhido.');
            return;
        }

        try {
            const response = await api.post(`/courses/${course.id}/attendances`, {
                date: formattedDate,
                course_id: course.id,
                start_time: startTime,
                end_time: endTime,
            });

            if (response.status === 201) {
                setSuccess('Chamada criada com sucesso!');
                onSuccess();
            } else {
                setError('Erro ao criar chamada.');
            }
        } catch (error) {
            console.error('Erro ao criar chamada:', error);
            setError('Erro ao criar chamada.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal create-call-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Criar Chamada para turma ID: {course.id}</h2>
                    <button onClick={onClose} className="close-button">
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="attendance-date">Data:</label>
                            <input
                                type="date"
                                id="attendance-date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="start-time">Hora de Início:</label>
                            <input
                                type="time"
                                id="start-time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="end-time">Hora de Término:</label>
                            <input
                                type="time"
                                id="end-time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="available-days">Dias Disponíveis:</label>
                            <select
                                id="available-days"
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                required
                            >
                                <option value="">Selecione um dia</option>
                                {course.weeks && course.weeks.map(week => (
                                    <option key={week.id} value={week.id}>
                                        {daysOfWeekMapping[week.id]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-buttons">
                            <button type="button" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit">
                                Salvar Chamada
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateCallModal;