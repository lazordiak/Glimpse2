import "./App.css";
import { Route, Routes } from "react-router-dom";
import { DataDisplay } from "./pages/DataDisplay";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DataDisplay />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
