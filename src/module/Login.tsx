import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/AuthService";
import { BiLeaf } from "react-icons/bi";
import "../styles/login.css";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Wypełnij wszystkie pola.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error", error);
      alert("Nie udało się zalogować. Sprawdź login i hasło.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Visual */}
      <div className="login-left">
        <div className="login-bg-image"></div>
        
        <div className="login-left-content">
            <div className="brand-icon">
                <BiLeaf size={32} color="white" />
            </div>
            <h1>
                Twoja uprawa <br/> pod pełną kontrolą.
            </h1>
            <p>
                Dołącz do nowoczesnych hodowców korzystających ze SmartGreenhouse. Monitoruj wilgotność, steruj temperaturą i zwiększaj plony dzięki AI.
            </p>
            
            <div className="social-proof">
                <div className="avatars">
                    {[1,2,3].map(i => (
                        <img key={i} className="avatar-img" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    ))}
                </div>
                <div>
                    <div style={{fontWeight: 'bold'}}>1k+ Rolników</div>
                    <div style={{opacity: 0.7, fontSize: '0.875rem'}}>Zaufało nam</div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2>Witaj ponownie!</h2>
            <p>Wpisz swoje dane, aby uzyskać dostęp.</p>
          </div>

          <div className="login-form">
            <div className="form-group">
              <label>Adres Email</label>
              <input
                type="text"
                className="form-input"
                placeholder="np. jan@kowalski.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Hasło</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-actions">
                <label className="checkbox-label">
                    <input type="checkbox" />
                    Zapamiętaj mnie
                </label>
                <button className="forgot-password">Odzyskaj hasło</button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner" style={{borderColor: 'rgba(255,255,255,0.3)', borderLeftColor: '#fff', width: '16px', height: '16px'}}></div>
                  Logowanie...
                </>
              ) : (
                <>
                  Zaloguj się do panelu
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width: '20px', height: '20px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
            
            <p className="register-link">
                Nie masz jeszcze konta? <button>Zarejestruj się</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;