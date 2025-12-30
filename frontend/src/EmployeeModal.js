import { useEffect, useState } from "react";
import api from "./api";

export default function EmployeeModal({ onClose }) {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
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

      // ✅ ABSOLUTE GUARD
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        console.error("Employees API returned non-array:", res.data);
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
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
      console.error("Add employee failed:", err);
      alert("Only admins can add employees");
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete employee?")) return;

    try {
      await api.delete(`/employees/${id}`, auth);
      loadEmployees();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="modal">
      <div className="modal-box">
        <h3>Employees</h3>

        <input
          placeholder="Employee name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={addEmployee}>Add Employee</button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <hr />

        {/* ✅ SAFE RENDER */}
        {employees.length === 0 && <p>No employees found</p>}

        {employees.map((emp) => (
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
