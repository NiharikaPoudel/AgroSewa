import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";

import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";

const app = express();  // create express app
const port = process.env.PORT || 5000;
connectDB();

// CORS setup to allow cookies and requests from frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,  // important to allow cookies
}));

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// API endpoints
app.get('/', (req, res) => res.send("API WORKING FINE NIHARIKA"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Server started on PORT:${port}`));
