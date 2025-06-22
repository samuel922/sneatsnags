import bcrypt from "bcryptjs";

async function doHash(password, saltValue) {
  return await bcrypt.hash(password, saltValue);
}

export default doHash;
