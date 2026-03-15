

import { useEffect, useState } from "react";

export default function SensorViewer() {
  const [data, setData] = useState([]);
  const [date, setDate] = useState("2026-03-14");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://ontimevolunteer.com/api/sensor_data.php?date=${date}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();

        if (!ignore) {
          setData(json.records || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [date]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sensor Data Viewer</h2>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Humidity</th>
            <th>Temperature</th>
            <th>Status</th>
            <th>PC Timestamp</th>
            <th>Server Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.humidity}</td>
              <td>{row.temperature}</td>
              <td>{row.status}</td>
              <td>{row.pc_timestamp}</td>
              <td>{row.server_timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
