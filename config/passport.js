const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Validate required profile data
        if (!profile.id || !profile.emails || !profile.emails[0] || !profile.emails[0].value) {
            return done(new Error('Invalid Google profile data'), null);
        }

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // Update user data
            user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
        }

        // Create new user
        const newUser = new User({
            googleId: profile.id,
            username: profile.emails[0].value.split('@')[0], // Use email prefix as username
            email: profile.emails[0].value,
            firstName: profile.name ? profile.name.givenName || '' : '',
            lastName: profile.name ? profile.name.familyName || '' : '',
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            lastLogin: new Date()
        });

        await newUser.save();
        return done(null, newUser);

    } catch (error) {
        console.error('Google OAuth Strategy error:', error);
        return done(error, null);
    }
}));

module.exports = passport;