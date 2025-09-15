import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,      // lấy từ Google Cloud
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check user tồn tại chưa
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // nếu chưa có thì tạo user mới
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "google_oauth2", // fake password, vì login Google không cần
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
