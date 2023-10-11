const User = require('../models/User')
const jwt = require('jsonwebtoken')

// giriş, çıkış ve şifre sıfırlama işlemleri için authentication middleware
const authentication = async (req, res, next) => {
	try {
		const token = req.cookies.token

		if (!token) {
			return res.status(401).json({ message: 'Bu işlemi yapmak için giriş yapmalısınız.' })
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		const user = await User.findById(decoded.id)

		if (!user) {
			return res.status(404).json({ message: 'Bu kullanıcı bulunamadı.' })
		}

		req.user = user

		next()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

// admin işlemleri için roleCheck middleware
const roleCheck = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Bu işlemi yapmak için yetkiniz bulunmamaktadır.' })
		}
		next()
	}
}

module.exports = { authentication, roleCheck }
