import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";

//Routes Imports
import authRouter from "./routers/authRouter.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5001;

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ message: "Hello from the server" });
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
