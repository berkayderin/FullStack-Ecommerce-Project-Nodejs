const Product = require('../models/Product')
const ProductFilter = require('../utils/productFilter')
const cloudinary = require('cloudinary').v2

const getAllProducts = async (req, res) => {
	try {
		const resultPerPage = 10

		const productFilter = new ProductFilter({
			query: Product.find(),
			queryString: req.query
		})
			.search()
			.filter()
			.pagination(resultPerPage)

		const products = await productFilter.query

		res.status(200).json(products)
	} catch (error) {
		res.status(500).json({ message: 'Tüm ürünler getirilemedi.' })
	}
}

const getAllProductsAdmin = async (req, res) => {
	try {
		const products = await Product.find()

		res.status(200).json(products)
	} catch (error) {
		res.status(500).json({ message: 'Tüm ürünler getirilemedi.' })
	}
}

const getProductById = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id)

		res.status(200).json(product)
	} catch (error) {
		res.status(500).json({ message: 'Ürün detayı getirilemedi.' })
	}
}

const createProduct = async (req, res, next) => {
	try {
		const product = await Product.create(req.body)

		let images = []
		if (typeof req.body.images === 'string') {
			images.push(req.body.images)
		} else {
			images = req.body.images
		}

		let allImages = []
		for (let i = 0; i < images.length; i++) {
			const result = await cloudinary.uploader.upload(images[i], {
				folder: 'products'
			})
			allImages.push({
				public_id: result.public_id,
				url: result.secure_url
			})
		}

		req.body.images = allImages
		req.body.user = req.user._id

		res.status(201).json(product)
	} catch (error) {
		res.status(500).json({ message: 'Ürün oluşturulamadı.' })
	}
}

const deleteProduct = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id)

		for (let i = 0; i < product.images.length; i++) {
			await cloudinary.uploader.destroy(product.images[i].public_id)
		}

		await product.remove()

		res.status(200).json({ message: 'Ürün silindi.' })
	} catch (error) {
		res.status(500).json({ message: 'Ürün silinemedi.' })
	}
}

const updateProduct = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id)

		let images = []
		if (typeof req.body.images === 'string') {
			images.push(req.body.images)
		} else {
			images = req.body.images
		}

		if (images !== undefined) {
			for (let i = 0; i < images.length; i++) {
				await cloudinary.uploader.destroy(images[i].public_id)
			}
		}

		let allImages = []
		for (let i = 0; i < images.length; i++) {
			const result = await cloudinary.uploader.upload(images[i], {
				folder: 'products'
			})

			allImages.push({
				public_id: result.public_id,
				url: result.secure_url
			})
		}

		req.body.images = allImages

		product = await Product.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		})

		res.status(200).json(product)
	} catch (error) {
		res.status(500).json({ message: 'Ürün güncellenemedi.' })
	}
}

const createProductReview = async (req, res, next) => {
	try {
		const { productId, comment, rating } = req.body

		const review = {
			user: req.user._id,
			name: req.user.name,
			comment,
			rating: Number(rating)
		}

		const product = await Product.findById(productId)
		product.reviews.push(review)

		let avg = 0
		product.reviews.forEach((rev) => {
			avg += rev.rating
		})

		product.rating = avg / product.reviews.length

		await product.save({ validateBeforeSave: false })
		res.status(201).json({ message: 'Yorum eklendi.' })
	} catch (error) {
		res.status(500).json({ message: 'Yorum eklenemedi.' })
	}
}

module.exports = {
	getAllProducts,
	getProductById,
	createProduct,
	deleteProduct,
	updateProduct,
	createProductReview,
	getAllProductsAdmin
}
