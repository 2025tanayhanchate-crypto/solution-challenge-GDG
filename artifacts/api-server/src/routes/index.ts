import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import volunteersRouter from "./volunteers";
import ngosRouter from "./ngos";
import missionsRouter from "./missions";
import resourcesRouter from "./resources";
import reportsRouter from "./reports";
import dashboardRouter from "./dashboard";
import geminiRouter from "./gemini";
import anthropicRouter from "./anthropic";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(volunteersRouter);
router.use(ngosRouter);
router.use(missionsRouter);
router.use(resourcesRouter);
router.use(reportsRouter);
router.use(dashboardRouter);
router.use(geminiRouter);
router.use(anthropicRouter);

export default router;
