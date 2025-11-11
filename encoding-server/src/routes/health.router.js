import express from "express";
import { HealthController } from "../controllers/health.controller.js";

const router = express.Router();
const healthController = new HealthController();

router.get("/", (req, res) => healthController.checkHealth(req, res));

export default router;