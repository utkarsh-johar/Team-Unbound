require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Models
const { sequelize, User, Institution } = require('./models');

// Route imports
const authRoutes = require('./routes/auth');
const consentRoutes = require('./routes/consent');
const githubRoutes = require('./routes/github');
const profileRoutes = require('./routes/profile');
const referralRoutes = require('./routes/referral');
const alumniRoutes = require('./routes/alumni');
const recruiterRoutes = require('./routes/recruiter');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');
const auditRoutes = require('./routes/audit');

const app = express();

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile, curl, Postman) or matching frontend
    if (!origin || origin === frontendUrl || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session store with Sequelize
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'Sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'skillbridge-secret-key-development-2026',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const googleId = profile.id;
    const name = profile.displayName || profile.name?.givenName || 'SkillBridge User';

    // 1. Check for existing user by googleId or email
    let user = null;
    if (googleId) {
      user = await User.findOne({ where: { googleId } });
    }
    if (!user && email) {
      user = await User.findOne({ where: { email } });
    }

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      return done(null, user);
    }

    // 2. New User: Check if email domain matches any institution's allowedEmailDomains
    let role = null;
    let matchedInstitutionId = null;

    if (email && Institution) {
      const emailDomain = email.split('@')[1]?.toLowerCase();
      const institutions = await Institution.findAll();

      for (const inst of institutions) {
        let allowed = inst.allowedEmailDomains;
        if (typeof allowed === 'string') {
          try {
            allowed = JSON.parse(allowed);
          } catch (e) {
            allowed = allowed.split(',').map(d => d.trim().toLowerCase());
          }
        }
        if (Array.isArray(allowed) && allowed.some(d => d.toLowerCase() === emailDomain)) {
          role = 'student';
          matchedInstitutionId = inst.id;
          break;
        }
      }
    }

    if (role === 'student') {
      user = await User.create({
        googleId,
        email,
        name,
        role: 'student',
        institutionId: matchedInstitutionId,
        isVerified: true,
        optedInReferrals: false
      });
      return done(null, user);
    }

    // Default to role selection flow (store in DB with role=null and in session)
    user = await User.create({
      googleId,
      email,
      name,
      role: null,
      institutionId: null,
      isVerified: false,
      optedInReferrals: false
    });

    if (req.session) {
      req.session.pendingUser = { googleId, email, name, id: user.id };
    }

    return done(null, user);
  } catch (err) {
    console.error('Google OAuth Strategy Callback Error:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    let user = null;
    try {
      user = await User.findByPk(id, {
        include: Institution ? [{ model: Institution, as: 'institution', required: false }] : []
      });
    } catch (assocErr) {
      user = await User.findByPk(id);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SkillBridge Backend API',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Server Initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (sequelize) {
      await sequelize.authenticate();
      console.log('PostgreSQL database connected.');
      await sequelize.sync();
      await sessionStore.sync();
      console.log('Database and session store synced.');
    }
    app.listen(PORT, () => {
      console.log(`SkillBridge Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.warn('Database connection error on startup:', error.message);
    // Start listening so endpoints and auth fallback remain testable
    app.listen(PORT, () => {
      console.log(`SkillBridge Backend running on http://localhost:${PORT} (DB offline)`);
    });
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
