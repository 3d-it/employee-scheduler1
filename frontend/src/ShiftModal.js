import { useState } from "react";
import api from "./api";

export default function ShiftModal({ cell, onClose }) {
  const [time, setTime] = useState("");
  const [type, setType] = useState("morning");

  const auth = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  };

  const save = async () => {
    if (!time.trim()) return;

    await api.post(
      "/admin/shifts",
      {
        employeeId: cell.emp.id,
        day: cell.day,
        time,
        type
      },
      auth
    );

    onClose();
  };

  const del = async () => {
    if (!window.confirm("Delete all shifts for this day?")) return;

    await api.delete("/admin/shifts", {
      ...auth,
      data: {
        employeeId: cell.emp.id,
        day: cell.day
      }
    });

    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-box">
        <h3>
          {cell.emp.name} — {cell.day}
        </h3>

        <input
          placeholder="9 - 5"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="morning">Morning</option>
          <option value="mid">Mid</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
        </select>

        <button onClick={save}>Save</button>
        <button onClick={del}>Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
