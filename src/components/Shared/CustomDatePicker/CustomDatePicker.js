import React, { useState, useRef, useEffect } from 'react';
import './CustomDatePicker.css';

/**
 * Componente CustomDatePicker
 * Implementa um seletor de data customizado com validações avançadas.
 * Características:
 * - Validação de datas inválidas
 * - Formatação automática
 * - Suporte a calendário visual
 * - Responsivo para mobile
 */

const CustomDatePicker = ({ value, onChange, placeholder, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [inputValue, setInputValue] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            // Corrigido para tratar a data corretamente
            const [year, month, day] = value.split('-');
            setInputValue(`${day}/${month}/${year}`);
        } else {
            setInputValue('');
        }
    }, [value]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        return Array.from({ length: daysInMonth }, (_, i) => ({
            year: year,
            month: month,
            day: i + 1,
            isCurrentMonth: true
        }));
    };



    const handleDateClick = (dateInfo) => {
        // Trabalha diretamente com os números, sem criar objeto Date
        const day = String(dateInfo.day).padStart(2, '0');
        const month = String(dateInfo.month + 1).padStart(2, '0');
        const year = dateInfo.year;
        
        setInputValue(`${day}/${month}/${year}`);
        onChange(`${year}-${month}-${day}`);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        let newValue = value;

        // Sistema de validação progressiva de datas
        newValue = newValue.replace(/[^\d]/g, '');

        // Validação por partes da data
        if (newValue.length >= 2) {
            // Validação do dia (01-31)
            const day = parseInt(newValue.substring(0, 2));
            if (day < 1 || day > 31) return;
            newValue = newValue.substring(0, 2) + (newValue.length > 2 ? '/' : '') + newValue.substring(2);
        }
        if (newValue.length >= 5) {
            // Validação do mês (01-12)
            const month = parseInt(newValue.substring(3, 5));
            if (month < 1 || month > 12) return;
            newValue = newValue.substring(0, 5) + (newValue.length > 5 ? '/' : '') + newValue.substring(5);
        }
        if (newValue.length > 10) {
            newValue = newValue.substring(0, 10);
        }

        setInputValue(newValue);

        // Validação completa quando a data estiver totalmente preenchida
        if (newValue.length === 10) {
            const [day, month, year] = newValue.split('/').map(Number);
            
            // Validações adicionais de data
            if (year < 1900 || year > 2100) return; 
            
            // Validação específica de dias por mês
            const daysInMonth = new Date(year, month, 0).getDate();
            if (day > daysInMonth) return;

            onChange(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
        } else {
            onChange('');
        }
    };

    const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const days = getDaysInMonth(currentMonth);

    return (
        <div className={`custom-datepicker ${className || ''}`} ref={wrapperRef}>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onClick={() => setIsOpen(!isOpen)}
                placeholder={placeholder || 'DD/MM/AAAA'}
                maxLength="10"
            />
            {isOpen && (
                <div className="datepicker-dropdown">
                    <div className="datepicker-header">
                        <button onClick={handlePrevMonth}>&lt;</button>
                        <span>{monthName}</span>
                        <button onClick={handleNextMonth}>&gt;</button>
                    </div>
                    <div className="datepicker-weekdays">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="weekday">{day}</div>
                        ))}
                    </div>
                    <div className="datepicker-days">
                        {days.map(({ year, month, day }) => (
                            <button
                                key={`${year}-${month}-${day}`}
                                onClick={() => handleDateClick({ year, month, day })}
                                className={value === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? 'selected' : ''}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
