import { useEffect, useState } from "react";
import api from "./api";

export default function EmployeeModal({ onClose }) {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const auth = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const res = await api.get("/employees", auth);

      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        console.error("Employees API returned non-array:", res.data);
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
      setEmployees([]);

      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Unable to load employees.");
      }
    }
  }

  async function addEmployee() {
    if (!name.trim()) return;

    try {
      await api.post("/employees", { name }, auth);
      setName("");
      loadEmployees();
    } catch {
      alert("Only admins can add employees");
    }
  }

  async function deleteEmployee(id) {
    if (!window.confirm("Delete employee?")) return;

    try {
      await api.delete(`/employees/${id}`, auth);
      loadEmployees();
    } catch {
      alert("Delete failed");
    }
  }

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

        {/* ✅ RENDER GUARD (THIS IS THE KEY) */}
        {Array.isArray(employees) && employees.length === 0 && (
          <p>No employees found</p>
        )}

        {Array.isArray(employees) &&
          employees.map((emp) => (
            <div
              key={emp.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
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
