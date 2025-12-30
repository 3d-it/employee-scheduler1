import { useEffect, useState } from "react";
import api from "./api";
import ShiftModal from "./ShiftModal";
import EmployeeModal from "./EmployeeModal";
import "./scheduler.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [activeCell, setActiveCell] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const auth = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const empRes = await api.get("/admin/employees", auth);
      const shiftRes = await api.get("/admin/shifts", auth);

      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setShifts(Array.isArray(shiftRes.data) ? shiftRes.data : []);
    } catch (err) {
      console.error("Failed to load admin data", err);
      setEmployees([]);
      setShifts([]);
    }
  };

  const cellShifts = (empId, day) => {
    if (!Array.isArray(shifts)) return [];
    return shifts.filter(
      s => s.employee_id === empId && s.day === day
    );
  };

  return (
    <div className="scheduler">
      <div className="header">
        <strong>Employee Scheduler</strong>
        <button onClick={() => setShowEmployeeModal(true)}>
          Manage Employees
        </button>
      </div>

      {/* DESKTOP GRID */}
      <div className="grid desktop">
        <div className="header-cell">Employee</div>
        {DAYS.map(day => (
          <div key={day} className="header-cell">{day}</div>
        ))}

        {employees.map(emp => (
          <div key={emp.id} style={{ display: "contents" }}>
            <div className="employee">{emp.name}</div>

            {DAYS.map(day => (
              <div
                key={day}
                className="cell"
                onClick={() => setActiveCell({ emp, day })}
              >
                {cellShifts(emp.id, day).map(s => (
                  <div
                    key={s.id}
                    className={`shift ${s.shift_type}`}
                  >
                    {s.shift_time}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* MOBILE VIEW */}
      <div className="mobile">
        {employees.map(emp => (
          <div key={emp.id} className="employee-card">
            <strong>{emp.name}</strong>

            {DAYS.map(day => (
              <div
                key={day}
                className="day-row"
                onClick={() => setActiveCell({ emp, day })}
              >
                <span>{day}</span>

                <div>
                  {cellShifts(emp.id, day).length > 0
                    ? cellShifts(emp.id, day).map(s => (
                        <span
                          key={s.id}
                          className={`shift ${s.shift_type}`}
                        >
                          {s.shift_time}
                        </span>
                      ))
                    : "Off"}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {activeCell && (
        <ShiftModal
          cell={activeCell}
          onClose={() => {
            setActiveCell(null);
            loadData();
          }}
        />
      )}

      {showEmployeeModal && (
        <EmployeeModal
          onClose={() => {
            setShowEmployeeModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
