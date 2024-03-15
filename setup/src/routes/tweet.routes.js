import {Router} from 'express'
import { createTweet, deleteTweet, getUserTweet, updateTweet } from '../controllers/tweet.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT)
router.route("/create-tweet").post(createTweet)
router.route("/get-tweets").get(getUserTweet)
router.route("/update-tweets").post(updateTweet)
router.route("/delete-tweets").delete(deleteTweet)

export default router;