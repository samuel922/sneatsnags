import express from "express";
import { authContoller } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authContoller.signup);
router.post("/signin", authContoller.signin);

export default router;
