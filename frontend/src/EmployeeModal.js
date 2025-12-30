import { useEffect, useState } from "react";
import api from "./api";

export default function EmployeeModal({ onClose }) {
  const [name, setName] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const res = await api.get("/admin/employees", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    setEmployees(res.data);
  };

  const addEmployee = async () => {
    if (!name.trim()) return;

    await api.post(
      "/admin/employees",
      { name },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setName("");
    loadEmployees();
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm("Delete employee and all shifts?")) return;

    await api.delete(`/admin/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    loadEmployees();
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