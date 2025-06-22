import jwt from "jsonwebtoken";

import prisma from "../db/prismaClient.js";
import { validations } from "../middlewares/validator.js";
import { comparePassword } from "../utils/comparePassword.js";
import doHash from "../utils/hashing.js";

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

    if (error) {
      return res.json({ success: false, message: error.details[0].message });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      res.status(404).json({ success: false, message: "User does not exist" });
    }

    //compare password
    const isPasswordMatching = await comparePassword(
      password,
      existingUser.passord
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
        expires: new Date(Date.now + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({ success: true, message: "Login successful", token });
  } catch (err) {
    console.log(err.message);
  }
}

export const authContoller = {
  signup,
  signin,
};
