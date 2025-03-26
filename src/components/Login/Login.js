/**
 * Componente Login
 * Gerencia autenticação e seleção de polo do usuário
 */

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import Modal from 'react-modal';
import "./Login.css";
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

Modal.setAppElement('#root');

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-page');

    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  /**
   * Realiza autenticação do usuário
   */
  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginResponse = await api.post("/login", {
        email: username,
        password: password,
      });

      if (!loginResponse.data.token) {
        throw new Error("Falha na autenticação");
      }

      localStorage.setItem("token", loginResponse.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;

      setIsLoggedIn(loginResponse.data.token, loginResponse.data.user);

      const isMobile = window.innerWidth <= 768;
      navigate(isMobile ? '/chamadas' : '/dashboard');
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      setError("Usuário ou senha inválidos");
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : "Entrar"}
          </button>
        <h1>
          Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
        </h1>
        </form>
      </div>

      <Modal
        isOpen={false}
        ariaHideApp={false}
      />
    </>
  );
}

export default Login;