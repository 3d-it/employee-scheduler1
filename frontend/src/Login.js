import { useState } from "react";
import api from "./api";

export default function Login({ setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await api.post("/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      setRole(res.data.role);
      setError("");
    } catch (err) {
      setError("Invalid login");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h2>Employee Scheduler Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={login} style={{ width: "100%" }}>
        Login
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
