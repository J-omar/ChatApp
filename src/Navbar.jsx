import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("auth");
    setUser(null);
    navigate("/login");
  }

  return (
    <nav
      style={{
        padding: "0.75rem 1.5rem",
        background: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Vänster del */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/" style={{ fontWeight: "bold", color: "#333" }}>
          Hem
        </Link>
        {!user && (
          <>
            <Link to="/login" style={{ color: "#333" }}>
              Logga in
            </Link>
            <Link to="/register" style={{ color: "#333" }}>
              Registrera
            </Link>
          </>
        )}
      </div>

      {/* Höger del */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={user.avatar}
            alt="avatar"
            width="40"
            height="40"
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
          <span style={{ fontWeight: "500" }}>{user.username}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              background: "#f5f5f5",
              cursor: "pointer",
            }}
          >
            Logga ut
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
