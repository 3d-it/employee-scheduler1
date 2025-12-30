import { useEffect, useState } from "react";
import api from "./api";

export default function EmployeeModal({ onClose }) {
  const [name, setName] = useState("");
  const [employees, setEmployees] = useState([]); // ✅ MUST be array
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const res = await api.get("/employees", auth);

      // ✅ HARD SAFETY CHECK
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load employees", err);
      setEmployees([]); // ✅ prevents crash
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async () => {
    if (!name.trim()) return;

    try {
      await api.post(
        "/employees",
        { name },
        auth
      );

      setName("");
      loadEmployees();
    } catch (err) {
      console.error("Failed to add employee", err);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete employee and all shifts?")) return;

    try {
      await api.delete(`/employees/${id}`, auth);
      loadEmployees();
    } catch (err) {
      console.error("Failed to delete employee", err);
    }
  };

  return (
    <div className="modal">
      <div className="modal-box">
        <h3>Manage Employees</h3>

        <input
          placeholder="New employee name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={addEmployee}>Add Employee</button>

        <hr />

        {loading && <p>Loading employees...</p>}

        {/* ✅ SAFE MAP — WILL NEVER CRASH */}
        {(Array.isArray(employees) ? employees : []).length === 0 && !loading && (
          <p>No employees found</p>
        )}

        {(Array.isArray(employees) ? employees : []).map((emp) => (
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
