
import express from "express";
import axios from "axios";

const router = express.Router();

/* ==========================================
   GET /api/weather?city=Kathmandu
========================================== */
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "WEATHER_API_KEY missing in .env",
      });
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: process.env.WEATHER_API_KEY,
          units: "metric",
        },
      }
    );

    const data = response.data;

    return res.json({
      success: true,
      data: {
        city: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        windSpeed: data.wind.speed,
      },
    });
  } catch (error) {
    console.log("🔥 WEATHER ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message || "Weather fetch failed",
    });
  }
});

export default router;
