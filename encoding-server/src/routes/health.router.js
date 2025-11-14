import express from "express";
import { healthController } from "../container.js";

const router = express.Router();

router.get("/", (req, res) => healthController.checkHealth(req, res));

export default router;