const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, minlength: 6 },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    settings: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      aiSuggestions: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      workStartHour: { type: Number, default: 9 },
      workEndHour: { type: Number, default: 18 },
      theme: { type: String, default: 'dark' },
      language: { type: String, default: 'en' }
    },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    productivityScore: { type: Number, default: 0 }
  },
  { timestamps: true }
)

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  this.password = await bcrypt.hash(this.password, 12)
})

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', UserSchema)
