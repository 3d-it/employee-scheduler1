import { useEffect, useState } from "react";
import api from "./api";

export default function EmployeeModal({ onClose }) {
  const [employees, setEmployees] = useState([]); // ALWAYS array
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

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

      // ✅ FORCE ARRAY
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        console.warn("Employees API returned non-array:", res.data);
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to load employees", err);
      setEmployees([]);
      setError("Failed to load employees");
    }
  }

  async function addEmployee() {
    if (!name.trim()) return;

    try {
      await api.post("/employees", { name }, auth);
      setName("");
      loadEmployees();
    } catch (err) {
      console.error("Failed to add employee", err);
      setError("Failed to add employee");
    }
  }

  async function deleteEmployee(id) {
    try {
      await api.delete(`/employees/${id}`, auth);
      loadEmployees();
    } catch (err) {
      console.error("Failed to delete employee", err);
      setError("Failed to delete employee");
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Manage Employees</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Employee name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={addEmployee}>Add</button>
        </div>

        <ul style={{ marginTop: "16px" }}>
          {Array.isArray(employees) && employees.length > 0 ? (
            employees.map((emp) => (
              <li key={emp.id} style={{ marginBottom: "6px" }}>
                {emp.name}
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => deleteEmployee(emp.id)}
                >
                  X
                </button>
              </li>
            ))
          ) : (
            <li>No employees found</li>
          )}
        </ul>

        <button onClick={onClose} style={{ marginTop: "12px" }}>
          Close
        </button>
      </div>
    </div>
  );
}
