import { useState } from "react";
import axios from "axios";

const WeatherDashboard = () => {
  const [city, setCity] = useState("Kathmandu");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `http://localhost:5000/api/weather?city=${city}`
      );

      if (res.data.success) {
        setWeather(res.data.data);
      } else {
        setError("Weather fetch failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌾 AgroSewa Weather Dashboard</h1>

      <div style={styles.searchBox}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          style={styles.input}
        />
        <button onClick={fetchWeather} style={styles.button}>
          Get Weather
        </button>
      </div>

      {loading && <p>Loading weather...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && (
        <div style={styles.card}>
          <h2>{weather.city}</h2>
          <p>🌡 Temperature: {weather.temperature} °C</p>
          <p>💧 Humidity: {weather.humidity} %</p>
          <p>🌬 Wind Speed: {weather.windSpeed} m/s</p>
          <p>🌤 Condition: {weather.description}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #d8f3dc, #b7e4c7)",
    padding: "40px",
    fontFamily: "Arial",
    textAlign: "center",
  },
  title: {
    marginBottom: "30px",
  },
  searchBox: {
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    marginRight: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2d6a4f",
    color: "white",
    cursor: "pointer",
  },
  card: {
    background: "white",
    padding: "25px",
    borderRadius: "15px",
    width: "300px",
    margin: "20px auto",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
};

export default WeatherDashboard;
