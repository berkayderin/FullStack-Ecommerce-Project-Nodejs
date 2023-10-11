class ProductFilter {
	constructor({ query, queryString }) {
		this.query = query
		this.queryString = queryString
	}

	search() {
		const keyword = this.queryString.keyword
			? {
					name: {
						$regex: this.queryString.keyword,
						$options: 'i'
					}
			  }
			: {}

		this.query = this.query.find({ ...keyword })
		return this
	}
	filter() {
		const queryCopy = { ...this.queryString }
		const deleteArea = ['keyword', 'limit', 'page']
		deleteArea.forEach((item) => delete queryCopy[item])

		const queryString = JSON.stringify(queryCopy)
		queryString = queryString.replace(/\b(gt | lt | lte )\b/g, (key) => `$${key}`)

		this.query = this.query.find(JSON.parse(queryString))
		return this
	}
	pagination(resultPerPage) {
		const activePage = this.queryString.page || 1
		const skip = resultPerPage * (activePage - 1)
		this.query = this.query.limit(resultPerPage).skip(skip)
		return this
	}
}

module.exports = ProductFilter
