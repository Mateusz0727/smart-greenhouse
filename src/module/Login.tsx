import React, { useState } from "react";
import "../styles/Login.css";
import { login } from "../services/AuthService";
import { useNavigate } from "react-router-dom";

function Login() {
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
    alert("Błąd logowania. Sprawdź dane.");
    console.error("Login error", error);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="main">
      <div className="left">
        <h1>SmartGreenhouse</h1>
       
      </div>
      <div className="right">
        <div className="login-box">
          <h2>Zaloguj się do swojego konta</h2>
          <input
            type="text"
            placeholder="Email lub login"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
          <div className="forgot-password">Nie pamiętasz hasła?</div>
        </div>
      </div>
    </div>
  );
}

export default Login;
