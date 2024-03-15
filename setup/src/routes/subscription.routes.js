import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscription, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT)
router.route("/c/:channelId").post(toggleSubscription)
router.route("/get-subscribers").get(getUserChannelSubscription)
router.route("/get-channels").get(getSubscribedChannels)

export default router;