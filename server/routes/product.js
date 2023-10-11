const express = require('express')
const router = express.Router()

const {
	getAllProducts,
	getProductById,
	createProduct,
	deleteProduct,
	updateProduct,
	createProductReview,
	getAllProductsAdmin
} = require('../controllers/product')

const { authentication, roleCheck } = require('../middleware/auth')

router.get('/products', getAllProducts)
router.get('/products/:id', getProductById)
router.get('/admin/products', authentication, roleCheck('admin'), getAllProductsAdmin)

router.post('/products', authentication, roleCheck('admin'), createProduct)
router.post('/products/reviews', authentication, createProductReview)

router.delete('/products/:id', authentication, roleCheck('admin'), deleteProduct)
router.patch('/products/:id', authentication, roleCheck('admin'), updateProduct)

module.exports = router
