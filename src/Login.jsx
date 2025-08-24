import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Hämta CSRF-token
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch("https://chatify-api.up.railway.app/csrf", {
          method: "PATCH",
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        console.error("CSRF fetch error:", err);
        setError("Kunde inte hämta CSRF-token");
      }
    };
    fetchCsrf();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Användarnamn och lösenord krävs");
      return;
    }
    if (!csrfToken) {
      setError("CSRF-token saknas");
      return;
    }

    try {
      const res = await fetch("https://chatify-api.up.railway.app/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password, csrfToken }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Inloggning misslyckades (${res.status})`
        );
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("storage"));
      }

      navigate("/chat");
    } catch (err) {
      console.error("Inloggningsfel:", err);
      setError(err.message || "Inloggning misslyckades");
    }
  };

  return (
    <div>
      <h1>ChatApp</h1>
      <h2>Logga in👤</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Användarnamn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Logga in</button>
      </form>
      <p>
        Har du inget konto? <Link to="/register">Registrera dig här</Link>
      </p>
    </div>
  );
};

export default Login;
