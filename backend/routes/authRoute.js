import { Router } from "express";
import passport from "passport";
import { googleCallback } from "../controllers/authController.js";
import "../config/passport.js"; // load Google Strategy

const router = Router();

// Bước 1: user click login Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Bước 2: Google redirect về callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;
