import jwt from "jsonwebtoken";

import prisma from "../db/prismaClient.js";
import { validations } from "../middlewares/validator.js";
import { comparePassword } from "../utils/comparePassword.js";
import doHash from "../utils/hashing.js";
import transport from "../middlewares/sendEmail.js";
import { hmacProcess } from "../utils/hmacProcess.js";

async function signup(req, res) {
  const { email, password } = req.body;

  console.log(email, password);

  try {
    const { error, value } = validations.signupSchema.validate({
      email,
      password,
    });

    if (error) {
      return res.json({ success: false, message: error.details[0].message });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await doHash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    newUser.password = undefined;

    res.status(201).json({
      success: true,
      message: "Your account has been created successfully",
      newUser,
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function signin(req, res) {
  const { email, password } = req.body;

  try {
    const { error, value } = validations.signinSchema.validate({
      email,
      password,
    });

    console.log(value, error);

    if (error) {
      return res.json({ success: false, message: error.details[0].message });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    console.log(existingUser);

    if (!existingUser) {
      res.status(404).json({ success: false, message: "User does not exist" });
    }

    //compare password
    const isPasswordMatching = await comparePassword(
      password,
      existingUser.password
    );

    if (!isPasswordMatching) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    //Create a token
    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ success: true, message: "Login successful", token });
  } catch (err) {
    console.log(err.message);
  }
}

async function signout(req, res) {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
}

async function sendVerificationCode(req, res) {
  const { email } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist." });
    }

    if (existingUser.verified) {
      return res.json({ success: false, message: "You're already verified." });
    }

    const codeValue = Math.floor(Math.random() * 10000).toString();

    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Verification Code",
      html: "<h1>" + codeValue + "</h1>",
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );

      const updatedUser = await prisma.user.update({
        where: {
          email: existingUser.email,
        },
        data: {
          verificationCode: hashedCodeValue,
          verificationCodeValidation: Date.now(),
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "Verification code sent." });
    } else {
      return res.json({
        success: false,
        message: "Sending verification code failed!",
      });
    }
  } catch (err) {
    console.log(err.message);
  }
}

export const authContoller = {
  signup,
  signin,
  signout,
  sendVerificationCode,
};
