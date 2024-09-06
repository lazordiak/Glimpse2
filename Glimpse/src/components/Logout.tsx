import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
};
