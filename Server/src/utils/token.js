import crypto from "node:crypto";

export const generateEmailToken = () => {
    const token = crypto
    .randomBytes(32)
    .toString("hex");

    const hashToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    return { token, hashToken };
}