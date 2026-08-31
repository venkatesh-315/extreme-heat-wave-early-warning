const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['authority', 'citizen', 'admin'],
      default: 'citizen',
    },
    title: {
      type: String,
      default: 'Community Resident',
    },
    department: {
      type: String,
      default: 'Civic Safety Network',
    },
    avatar: {
      type: String,
      default: 'TG',
    },
    badge: {
      type: String,
      default: 'Verified Access',
    },
    terminalAuthorized: {
      type: Boolean,
      default: false,
    },
    preferredLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    preferredLocationName: {
      type: String,
      default: 'New Delhi',
    },
    alertSettings: {
      alertsOptIn: {
        type: Boolean,
        default: true,
      },
      channels: {
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
      },
      minThresholdLevel: {
        type: String,
        enum: ['YELLOW', 'ORANGE', 'RED'],
        default: 'YELLOW',
      },
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    fcmTokens: [
      {
        token: {
          type: String,
          required: true,
          trim: true,
        },
        deviceType: {
          type: String,
          default: 'web',
        },
        userAgent: {
          type: String,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        lastUsedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

// Public JSON serializer (strips password)
UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    title: this.title,
    department: this.department,
    avatar: this.avatar,
    badge: this.badge,
    terminalAuthorized: this.terminalAuthorized,
    preferredLocation: this.preferredLocation,
    preferredLocationName: this.preferredLocationName,
    alertSettings: this.alertSettings,
    fcmTokensCount: Array.isArray(this.fcmTokens) ? this.fcmTokens.length : 0,
    hasFcmToken: Array.isArray(this.fcmTokens) && this.fcmTokens.length > 0,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
