const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const crypto = require('crypto')
const nodeMailer = require('nodemailer')

const register = async (req, res) => {
	const avatar = await cloudinary.uploader.upload(req.body.avatar, {
		folder: 'avatars',
		width: 130,
		crop: 'scale'
	})

	const { name, email, password } = req.body

	try {
		const user = await User.findOne({ email })

		if (user) {
			return res.status(400).json({ message: 'Bu email adresi zaten kayıtlı.' })
		}

		const hashPassword = await bcrypt.hash(password, 10)

		if (password.minLength < 6) {
			return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' })
		}

		const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
		if (!emailRegex.test(email)) {
			return res.status(400).json({ message: 'Lütfen geçerli bir email adresi giriniz.' })
		}

		const newUser = await User.create({
			name,
			email,
			password: hashPassword,
			avatar: {
				public_id: avatar.public_id,
				url: avatar.secure_url
			}
		})

		const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
			expiresIn: '1h'
		})

		const cookieOptions = {
			httpOnly: true,
			expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
		}

		res.cookie('token', token, cookieOptions)

		res.status(201).json({ message: 'Kayıt başarılı.' })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

const login = async (req, res) => {
	const { email, password } = req.body

	try {
		const user = await User.findOne({ email })

		if (!user) {
			return res.status(404).json({ message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.' })
		}

		const isMatch = await bcrypt.compare(password, user.password)

		if (!isMatch) {
			return res.status(400).json({ message: 'Geçersiz şifre.' })
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h'
		})

		const cookieOptions = {
			httpOnly: true,
			expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
		}

		res.cookie('token', token, cookieOptions)

		res.status(200).json({ message: 'Giriş başarılı.' })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

const logout = async (req, res) => {
	const cookieOptions = {
		httpOnly: true,
		expires: new Date(Date.now())
	}

	res.cookie('token', null, cookieOptions)

	res.status(200).json({ message: 'Çıkış başarılı.' })
}

const forgotPassword = async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email })

		if (!user) {
			return res.status(404).json({ message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.' })
		}

		const resetToken = crypto.randomBytes(20).toString('hex')

		user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
		user.resetPasswordExpire = Date.now() + 30 * 60 * 1000

		await user.save({ validateBeforeSave: false })

		const passwordUrl = `${req.protocol}://${req.get('host')}//reset/${resetToken}`

		const message = `
			Şifrenizi sıfırlamak için lütfen aşağıdaki linke tıklayınız.
			\n\n
			${passwordUrl}
		`

		try {
			const transporter = nodeMailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.SMTP_EMAIL,
					pass: process.env.SMTP_PASSWORD
				}
			})

			const mailData = {
				from: process.env.SMTP_EMAIL,
				to: user.email,
				subject: 'Şifre Sıfırlama',
				text: message
			}

			await transporter.sendMail(mailData)

			res.status(200).json({ message: 'Şifre sıfırlama maili gönderildi.' })
		} catch (error) {
			user.resetPasswordToken = undefined
			user.resetPasswordExpire = undefined

			await user.save({ validateBeforeSave: false })

			return res.status(500).json({ message: 'Şifre sıfırlama maili gönderilemedi.' })
		}
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

const resetPassword = async (req, res) => {
	try {
		const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpire: { $gt: Date.now() }
		})

		if (!user) {
			return res.status(400).json({ message: 'Geçersiz token.' })
		}

		const hashPassword = await bcrypt.hash(req.body.password, 10)

		user.password = hashPassword
		user.resetPasswordToken = undefined
		user.resetPasswordExpire = undefined

		await user.save()

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h'
		})

		const cookieOptions = {
			httpOnly: true,
			expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
		}

		res.cookie('token', token, cookieOptions)

		res.status(200).json({ message: 'Şifre sıfırlama başarılı.' })
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

const getUserProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id)

		res.status(200).json(user)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

module.exports = {
	register,
	login,
	logout,
	forgotPassword,
	resetPassword,
	getUserProfile
}
