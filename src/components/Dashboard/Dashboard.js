import React, { useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement, // Registrar o elemento PointElement
    Tooltip,
    Legend,
} from 'chart.js';
import './Dashboard.css';
import { FaDog, FaDonate, FaExclamationTriangle, FaHeartbeat, FaChartPie, FaChartBar } from 'react-icons/fa';

// Registrar os componentes necessários do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend);

const Dashboard = () => {
    const [selectedAccount, setSelectedAccount] = useState('Conta 1');

    const despesasData = {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril'],
        datasets: [
            {
                label: 'Despesas (R$)',
                data: [4000, 2500, 3000, 1000],
                borderColor: 'var(--primary-color)',
                backgroundColor: 'rgba(230, 140, 58, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const saldoData = {
        labels: ['Conta Corrente', 'Poupança', 'Investimentos'],
        datasets: [
            {
                data: [2500, 1500, 500],
                backgroundColor: [
                  '#e68c3a',
                  '#213e60',
                  '#6c757d',
                  '#dc3545',
                ],
            },
        ],
    };

    const contasData = {
        'Conta 1': {
            ganhos: [5000, 3000, 2000],
            gastos: [2000, 1500, 1000],
        },
        'Conta 2': {
            ganhos: [4000, 2500, 1500],
            gastos: [100, 1000, 500],
        },
        'Conta 3': {
            ganhos: [6000, 3500, 2500],
            gastos: [3000, 2000, 1500],
        },
        'Conta 4': {
            ganhos: [7000, 4000, 3000],
            gastos: [3500, 2500, 2000],
        },
    };

    const contaSelecionadaData = {
        labels: ['Janeiro', 'Fevereiro', 'Março'],
        datasets: [
            {
                label: 'Ganhos (R$)',
                data: contasData[selectedAccount].ganhos,
                backgroundColor:      '#e68c3a',
                borderColor: 'var(--secondary-color)',
                borderWidth: 1,
            },
            {
                label: 'Gastos (R$)',
                data: contasData[selectedAccount].gastos,
                backgroundColor: '#213e60',
                borderColor: 'var(--primary-color)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="dashboard" >
            <h1 className="dashboard-title">Associação de Animais</h1>
            <p className="dashboard-date">Quarta-feira, 26 de março de 2025</p>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <FaDog className="dashboard-icon" />
                    <h2>Total de animais</h2>
                    <p>120</p>
                    <p>castrados: 110</p>
                    <p>doados: 10</p>
                </div>
                <div className="dashboard-card">
                    <FaExclamationTriangle className="dashboard-icon" />
                    <h2>Denúncias</h2>
                    <p>Recebidas: 45</p>
                </div>
                <div className="dashboard-card">
                    <FaDonate className="dashboard-icon" />
                    <h2>Doações</h2>
                    <p>Total arrecadado no ano: R$ 25.000</p>
                    <p>Total arrecadado no mês: R$ 15.000</p>
                    <p>Total arrecadado na semana: R$ 500</p>
                </div>
                <div className="dashboard-card">
                    <FaHeartbeat className="dashboard-icon" />
                    <h2>Animais Doentes</h2>
                    <p>Em tratamento: 12</p>
                    <p>Recuperados: 8</p>
                </div>
            </div>
            <div className="dashboard-graphs">
                <div className="dashboard-card">
                    <FaChartBar className="dashboard-icon" />
                    <h2>Gráfico fixo de Despesas mensais</h2>
                    <Line data={despesasData} />
                </div>
                <div className="dashboard-card">
                    <FaChartPie className="dashboard-icon" />
                    <h2>Gráfico de Saldo</h2>
                    <Pie data={saldoData} />
                </div>
                <div className="dashboard-card">
                    <FaChartBar className="dashboard-icon" />
                    <h2>Gráfico de Conta Bancária</h2>
                    <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        className="account-selector"
                    >
                        <option value="Conta 1">Conta 1</option>
                        <option value="Conta 2">Conta 2</option>
                        <option value="Conta 3">Conta 3</option>
                        <option value="Conta 4">Conta 4</option>
                    </select>
                    <Bar data={contaSelecionadaData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
