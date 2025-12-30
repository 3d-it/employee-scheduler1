import { useEffect, useState } from "react";
import api from "./api";

export default function EmployeeModal({ onClose }) {
  const [name, setName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  const auth = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees", auth);

      // ✅ HARD GUARD — only accept arrays
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to load employees", err);
      setEmployees([]);
      setError("Failed to load employees");
    }
  };

  const addEmployee = async () => {
    if (!name.trim()) return;

    try {
      await api.post("/employees", { name }, auth);
      setName("");
      loadEmployees();
    } catch (err) {
      console.error("Failed to add employee", err);
      alert("You must be logged in as admin");
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete employee and all shifts?")) return;

    try {
      await api.delete(`/employees/${id}`, auth);
      loadEmployees();
    } catch (err) {
      console.error("Failed to delete employee", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="modal">
      <div className="modal-box">
        <h3>Manage Employees</h3>

        <input
          placeholder="New employee name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button onClick={addEmployee}>Add Employee</button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <hr />

        {/* ✅ SAFE MAP */}
        {employees.length === 0 && <p>No employees found</p>}

        {employees.map(emp => (
          <div
            key={emp.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px"
            }}
          >
            <span>{emp.name}</span>
            <button
              style={{ background: "#dc2626", color: "white" }}
              onClick={() => deleteEmployee(emp.id)}
            >
              Delete
            </button>
          </div>
        ))}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
