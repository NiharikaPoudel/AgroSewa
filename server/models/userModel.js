import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // CHANGED: Now optional for Google OAuth
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' }, // NEW: Track auth method
    googleId: { type: String, sparse: true }, // NEW: Store Google ID
    picture: { type: String } // NEW: Store profile picture
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;