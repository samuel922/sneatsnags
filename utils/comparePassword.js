import bcrypt from "bcryptjs";

export const comparePassword = async (password, passwordToCompare) => {
  return await bcrypt.compare(password, passwordToCompare);
};
