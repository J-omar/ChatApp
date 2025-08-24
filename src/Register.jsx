import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "https://i.pravatar.cc/100",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setError("Alla fält är obligatoriska");
      return;
    }

    try {
      // Hämta CSRF-token
      const csrfRes = await fetch("https://chatify-api.up.railway.app/csrf", {
        method: "PATCH",
        credentials: "include",
      });

      const csrf = await csrfRes.json();
      const csrfToken = csrf.csrfToken;

      if (!csrfToken) {
        throw new Error("Kunde inte hämta CSRF-token");
      }

      // Registrera användare
      const registerRes = await fetch(
        "https://chatify-api.up.railway.app/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...formData,
            csrfToken,
          }),
        }
      );

      const regData = await registerRes.json();
      console.log("Register response:", regData); // 👈 logga alltid svaret

      if (!registerRes.ok) {
        throw new Error(
          regData.message || `Registrering misslyckades (${registerRes.status})`
        );
      }

      // Logga in direkt efter registrering
      const loginRes = await fetch(
        "https://chatify-api.up.railway.app/auth/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            csrfToken,
          }),
        }
      );

      const loginData = await loginRes.json();
      console.log("Login response:", loginData); // 👈 logga även login-svaret

      if (!loginRes.ok) {
        throw new Error(
          loginData.message ||
            `Inloggning efter registrering misslyckades (${loginRes.status})`
        );
      }

      localStorage.setItem("token", loginData.token);
      window.dispatchEvent(new Event("storage"));
      alert("Registrering lyckades. Du kan logga in nu");
      navigate("/login");
    } catch (err) {
      console.error("Registreringsfel:", err);
      setError(err.message || "Något gick fel");
    }
  };

  return (
    <div>
      <h2>Registrera 👤</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="username"
          placeholder="Användarnamn"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="E-post"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Lösenord"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Registrera</button>
      </form>
      <p>
        Har du redan ett konto? <Link to="/login">Logga in här</Link>
      </p>
    </div>
  );
};

export default Register;
