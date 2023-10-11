const mongoose = require('mongoose')

const ProductScheme = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		description: String,
		price: {
			type: Number,
			required: true
		},
		stock: {
			type: Number,
			required: true,
			default: 1
		},
		category: {
			type: String,
			required: true
		},
		rating: {
			type: Number,
			default: 0
		},
		images: [
			{
				public_id: {
					type: String,
					required: true
				},
				url: {
					type: String,
					required: true
				}
			}
		],
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		reviews: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'User'
				},
				name: {
					type: String,
					required: true
				},
				comment: {
					type: String,
					required: true
				},
				rating: {
					type: Number,
					required: true
				}
			}
		]
	},
	{
		timestamps: true
	}
)

const Product = mongoose.models.Product || mongoose.model('Product', ProductScheme)

module.exports = Product
