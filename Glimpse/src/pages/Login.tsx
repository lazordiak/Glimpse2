import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await axios.post<{ accessToken: string }>(
      "http://localhost:5000/login",
      {
        username,
        password,
      }
    );
    localStorage.setItem("token", response.data.accessToken);
    localStorage.setItem("user", username);
    navigate("/");
  };

  return (
    <div>
      <h1>Login</h1>
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={handleLogin}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
