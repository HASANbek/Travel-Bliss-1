const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const FileStorage = require('../utils/fileStorage');
const mongoose = require('mongoose');

// Initialize file storage for users
const usersStorage = new FileStorage('users.json');

/**
 * Foydalanuvchi autentifikatsiya qilinganligini tekshirish
 * JWT tokenni tekshirish va foydalanuvchini req.user ga qo'shish
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Tokenni olish (Header yoki Cookie dan)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Bearer token (Authorization header dan)
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Cookie dan
    token = req.cookies.token;
  }

  // 2. Token mavjudligini tekshirish
  if (!token) {
    return next(
      new ApiError(401, 'Bu sahifaga kirish uchun tizimga kirishingiz kerak')
    );
  }

  try {
    // 3. Tokenni verify qilish
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Foydalanuvchini topish
    let user;

    if (mongoose.connection.readyState !== 1) {
      // Use file storage
      user = await usersStorage.findById(decoded.id);
    } else {
      // Use MongoDB
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return next(new ApiError(401, 'Foydalanuvchi topilmadi'));
    }

    // 5. Akkaunt aktiv ekanligini tekshirish
    if (!user.isActive) {
      return next(new ApiError(403, 'Akkauntingiz bloklangan'));
    }

    // 6. Foydalanuvchini req ga qo'shish
    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Token yaroqsiz yoki muddati o\'tgan'));
  }
});

/**
 * Foydalanuvchi rolini tekshirish
 * @param  {...any} roles - Ruxsat etilgan rollar ro'yxati
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `${req.user.role} roli bu amalni bajarishga ruxsat berilmagan`
        )
      );
    }
    next();
  };
};

/**
 * Cookie parser middleware
 * Express 5 da built-in cookie parser mavjud emas,
 * shuning uchun oddiy implementatsiya
 */
exports.cookieParser = (req, res, next) => {
  const cookies = {};
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = decodeURIComponent(value);
    });
  }

  req.cookies = cookies;
  next();
};

/**
 * Admin rolini tekshirish middleware
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const ApiError = require('../utils/ApiError');
    return next(new ApiError(403, 'Bu amal faqat adminlar uchun ruxsat etilgan'));
  }
};
