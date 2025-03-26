import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import "./Register.css";
import api from '../../services/api';

Modal.setAppElement('#root');

function Register({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    reason: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem!');
        return;
      }

      const loginResponse = await api.post("/register", {
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        name: formData.name,
        confirmPassword: formData.confirmPassword,
      });

      // if (!loginResponse.data.token) {
      //   throw new Error("Falha na autenticação");
      // }

      setIsModalOpen(true);
    } catch (error) {
      console.error("Erro ao realizar registro:", error);
      setError("Erro ao realizar registro. Tente novamente.");
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const performLogin = async () => {
    const loginResponse = await api.post("/login", {
      email: formData.email,
      password: formData.password,
    });

    if (!loginResponse.data.token) {
      throw new Error("Falha na autenticação");
    }

    localStorage.setItem("token", loginResponse.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;

    setIsLoggedIn(loginResponse.data.token, loginResponse.data.user);

    const isMobile = window.innerWidth <= 768;
    navigate(isMobile ? '/chamadas' : '/dashboard');
  };

  const handleFinalizeNow = async () => {
    setError("");
    setIsLoading(true);

    try {
      await performLogin();
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      setError("Usuário ou senha inválidos");
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
    setIsModalOpen(false);
    navigate('/dashboard');
  };

  const handleEditLater = async () => {
    setError("");
    setIsLoading(true);

    try {
      await performLogin();
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      setError("Usuário ou senha inválidos");
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
    setIsModalOpen(false);
    navigate('/configuracao-usuario');
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Cadastro</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nome"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <div className="register-password-input">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Senha"
          />
          <button
            type="button"
            className="register-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        <div className="register-password-input">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmar Senha"
          />
          <button
            type="button"
            className="register-toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Telefone de Contato"
        />
        <select
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Selecione o motivo do registro</option>
          <option value="fazer denuncia">Fazer Denúncia</option>
          <option value="quero doar">Quero Doar</option>
          <option value="quero fazer parte da causa">Quero Fazer Parte da Causa</option>
          <option value="outros">Outros</option>
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Carregando..." : "Cadastrar"}
        </button>

        <h1>
          Já tem uma conta? <Link to="/">Faça login aqui</Link>
        </h1>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Só mais 1 etapa!</h2>
        <p>Obrigado por se cadastrar! Para finalizar, você precisa completar o cadastro. Deseja finalizar agora ou editar mais tarde?</p>
        <button onClick={handleFinalizeNow}>Finalizar Agora</button>
        <button onClick={handleEditLater}>Editar Mais Tarde</button>
      </Modal>
    </div>
  );
}

export default Register;
