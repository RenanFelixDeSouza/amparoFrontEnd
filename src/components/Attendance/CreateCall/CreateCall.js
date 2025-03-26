/**
 * Componente CreateCall
 * Gerencia a criação de chamadas para uma turma específica
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function CreateCall() {
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    /**
     * Busca alunos da turma ao inicializar
     */
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.get(`/courses/${id}/students`);
                const studentsData = response.data.map(student => ({
                    ...student,
                    attendanceStatus: 'P' // Default status is 'Presente'
                }));
                setStudents(studentsData);
                let initialAttendance = {};
                studentsData.forEach(student => {
                    initialAttendance[student.id] = 'P';
                });
                setAttendance(initialAttendance);
            } catch (error) {
                console.error('Erro ao buscar alunos da turma:', error);
                setError('Erro ao carregar os alunos da turma.');
            }
        };

        if (id) {
            fetchStudents();
        }
    }, [id]);

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prevAttendance => ({
            ...prevAttendance,
            [studentId]: status
        }));
    };

    /**
     * Salva a chamada no backend
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedDate = new Date(attendanceDate).toLocaleDateString('pt-BR');
            const response = await api.post(`/courses/${id}/attendances`, {
                date: formattedDate,
                attendances: Object.keys(attendance).map(studentId => ({
                    student_id: parseInt(studentId),
                    status: attendance[studentId]
                }))
            });

            if (response.status === 201) {
                setSuccess('Chamada registrada com sucesso!');
                navigate('/dashboard/chamadas'); 
            } else {
                setError('Erro ao registrar chamada.');
            }
        } catch (error) {
            console.error('Erro ao registrar chamada:', error);
            setError('Erro ao registrar chamada.');
        }
    };

    return (
        <div className="create-call-container">
            <h2>Criar Chamada para turma ID: {id}</h2>
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
                    <label>Alunos:</label>
                    <div className="students-list">
                        {students.map(student => (
                            <div key={student.id} className="student-item">
                                <label htmlFor={`student-${student.id}`}>{student.first_name} {student.last_name}</label>
                                <select
                                    id={`student-${student.id}`}
                                    value={attendance[student.id] || ''}
                                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                >
                                    <option value="P">Presente</option>
                                    <option value="F">Falta</option>
                                    <option value="FJ">Falta Justificada</option>
                                    <option value="PA">Presente com Atraso</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit">Registrar Chamada</button>
                <button type="button" onClick={() => navigate('/dashboard/turmas')}>
                    Cancelar
                </button>
            </form>
        </div>
    );
}

export default CreateCall;