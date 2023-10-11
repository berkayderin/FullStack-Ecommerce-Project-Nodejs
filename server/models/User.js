const mongoose = require('mongoose')

const UserScheme = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
			required: true
		},
		avatar: {
			public_id: {
				type: String,
				required: true
			},
			url: {
				type: String,
				required: true
			}
		},
		role: {
			type: String,
			default: 'user',
			required: true
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date
	},
	{
		timestamps: true
	}
)

const User = mongoose.models.User || mongoose.model('User', UserScheme)

module.exports = User
