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
    phone: ''
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

    // Validação dos campos
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      setError('Todos os campos são obrigatórios');
      setIsLoading(false);
      return;
    }

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem!');
        setIsLoading(false);
        return;
      }

      const response = await api.post("/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone
      });

      // Se o registro for bem sucedido, tenta fazer login
      if (response.data) {
        const loginResponse = await api.post("/login", {
          email: formData.email,
          password: formData.password,
        });

        if (loginResponse.data.token) {
          localStorage.setItem("token", loginResponse.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;
          setIsLoggedIn(loginResponse.data.token, loginResponse.data.user);
          setIsModalOpen(true);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Erro ao realizar registro. Tente novamente.");
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeNow = async () => {
    setError("");
    setIsLoading(true);

    try {
      navigate('/configuracao-usuario', { state: { initialTab: 'address' } });
    } catch (error) {
      setError("Erro ao redirecionar para a edição de usuário.");
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
    setIsModalOpen(false);
  };

  const handleEditLater = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Redireciona para o dashboard
      navigate('/dashboard');
    } catch (error) {
      setError("Erro ao redirecionar para o dashboard.");
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
    setIsModalOpen(false);
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
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
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
          required
        />
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
        className="modal-overlay"
        overlayClassName="modal"
      >
        <div className="modal-content">
          <h2>Só mais 1 etapa!</h2>
          <p>Obrigado por se cadastrar! Para finalizar, você precisa completar o cadastro. Deseja finalizar agora ou editar mais tarde?</p>
          <button onClick={handleFinalizeNow}>Finalizar Agora</button>
          <button onClick={handleEditLater}>Editar Mais Tarde</button>
        </div>
      </Modal>
    </div>
  );
}

export default Register;
