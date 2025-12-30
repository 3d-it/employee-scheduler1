import { useEffect, useState } from "react";
import api from "./api";

export default function EmployeeDashboard() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const res = await api.get("/my-schedule", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setSchedule(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Schedule</h2>

      {schedule.length === 0 && <p>No shifts assigned</p>}

      {schedule.map((s, i) => (
        <div key={i}>
          {s.day} — {s.shift_time} ({s.shift_type})
        </div>
      ))}
    </div>
  );
}
