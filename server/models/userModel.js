import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    verifyOtp: { type: String, default: '' },          // OTP as string
    verifyOtpExpireAt: { type: Number, default: 0 },   // timestamp
    resetOtp: { type: String, default: '' },           // Reset OTP as string
    resetOtpExpireAt: { type: Number, default: 0 },   // timestamp
    isAccountVerified: { type: Boolean, default: false }, // account status
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
