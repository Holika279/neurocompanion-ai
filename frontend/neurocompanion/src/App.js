import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [state, setState] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Upload a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "http://localhost:5000/analyze",
      formData
    );

    const values = res.data.values.map((v, i) => ({
      index: i,
      value: v,
    }));

    setData(values);
    setState(res.data.state);
    setConfidence(res.data.confidence);
    setMessage(res.data.message);

    speak(res.data.message);
  };

  // 🎤 Voice (Neural Nurse)
  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const pieData = [
    { name: "Confidence", value: confidence },
    { name: "Remaining", value: 100 - confidence },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧠 NeuroCompanion AI</h1>

      {/* Upload Section */}
      <div style={styles.card}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button style={styles.button} onClick={handleUpload}>
          Analyze EEG
        </button>
      </div>

      {/* EEG Graph */}
      {data.length > 0 && (
        <div style={styles.card}>
          <h2>EEG Signal Monitor</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00e5ff"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analysis */}
      {state && (
        <div style={styles.flex}>
          {/* Pie Chart */}
          <div style={styles.card}>
            <h3>Confidence</h3>
            <PieChart width={250} height={250}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill="#00e5ff" />
                <Cell fill="#1c1c1c" />
              </Pie>
            </PieChart>
            <h2>{confidence}%</h2>
          </div>

          {/* Neural Nurse */}
          <div style={styles.card}>
            <h2>🤖 Neural Nurse</h2>
            <h3 style={{ color: getColor(state) }}>{state}</h3>
            <p>{message}</p>
          </div>
        </div>
      )}

      {/* Report */}
      {state && (
        <div style={styles.card}>
          <h2>📄 Medical Report</h2>
          <p><b>Cognitive State:</b> {state}</p>
          <p><b>Confidence:</b> {confidence}%</p>
          <p><b>Remarks:</b> {message}</p>
        </div>
      )}
    </div>
  );
}

// 🎨 Styling (Premium Hospital Look)
const styles = {
  container: {
    background: "#0b0f1a",
    minHeight: "100vh",
    color: "white",
    padding: "20px",
    fontFamily: "Arial",
  },
  title: {
    textAlign: "center",
    color: "#00e5ff",
  },
  card: {
    background: "#121826",
    padding: "20px",
    margin: "20px",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(0,229,255,0.2)",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "#00e5ff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  flex: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
};

// 🎨 State Colors
function getColor(state) {
  switch (state) {
    case "Stressed":
      return "red";
    case "Focused":
      return "#00e5ff";
    case "Fatigue":
      return "orange";
    default:
      return "lightgreen";
  }
}

export default App;