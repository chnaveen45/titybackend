const crypto = require("crypto");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(this.password, salt, 100000, 64, "sha512").toString("hex");
  this.password = `${salt}:${hash}`;
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  const [salt, storedHash] = this.password.split(":");
  const candidateHash = crypto
    .pbkdf2Sync(candidatePassword, salt, 100000, 64, "sha512")
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(candidateHash, "hex"));
};

module.exports = mongoose.model("User", userSchema);
