import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { Sequelize } from "sequelize";
import asyncErrorHandler from "../error/asyncErrorHandler.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const sendOtpToEmail = asyncErrorHandler(async (req, res, next) => {
  const emailId = req.body.email;
  const fullName = req.body.fullName;
  const dob = req.body.dob;
  const password = req.body.dob;

  let saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    // validate Email
    if (!validator.isEmail(emailId)) throw Error("Invalid Email");

    const transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      host: process.env.NODEMAILER_HOST,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const num = generateOTP();
    const otp = num.toString();
    // console.log(otp);
    let hashedOtp = bcrypt.hashSync(otp, 8);

    const userDetails = {
      email: emailId,
      fullName,
      dob,
      hashedOtp,
      hashedPassword
    };

    const otpToken = jwt.sign(userDetails, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });

    const mailOptions = {
      from: "ankushoffice5@gmail.com",
      to: emailId,
      subject: "Email Verification OTP",
      text: `Your OTP for email verification is: ${otp} validity for OTP is 10 minutes`,
    };

    const info = await transporter.sendMail(mailOptions);
    if (!info) return next(new ErrorHandler("Failed to send otp", 400));
    return otpToken;
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const getRandomString = (length) => {
  let chars = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  let l = chars.length;
  let ans = "";
  for (let i = 0; i < length; i++) {
    ans += chars[Math.floor(Math.random() * l)];
  }
  return ans;
};

export const getImageName = (imagename = "") => {
  return Date.now().toString() + imagename;
};

export const removeNullValues = (obj) => {
  const result = {};
  for (const key in obj) {
    if (
      obj[key] !== null &&
      obj[key] !== undefined &&
      obj[key] !== "null" &&
      obj[key] !== ""
    ) {
      result[key] = obj[key];
    }
  }
  return result;
};

export const mailSender = async (email, title, body) => {
  try {
    let transpoter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      host: process.env.NODEMAILER_HOST,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    let info = await transpoter.sendMail({
      from: "Tweet",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    return info;
  } catch (error) {
    console.log(error);
  }
};
