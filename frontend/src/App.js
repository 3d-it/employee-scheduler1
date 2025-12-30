import { useState } from "react";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return <Login setRole={setRole} />;
  }

  return role === "admin" ? (
    <AdminDashboard />
  ) : (
    <EmployeeDashboard />
  );
}

export default App;
