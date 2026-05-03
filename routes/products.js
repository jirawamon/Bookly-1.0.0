const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
	// Request: read optional category query from the client
	const categoryQuery = (req.query.category || '').toString().trim();

	try {
		// Processing (Gatekeeper): read and parse the local JSON file safely
		const dataPath = path.join(__dirname, '..', 'project.json');
		const rawData = await fs.readFile(dataPath, 'utf8');
		const parsedData = JSON.parse(rawData);

		// Processing: normalize products to an array and filter by category if provided
		const products = Array.isArray(parsedData)
			? parsedData
			: Array.isArray(parsedData.products)
				? parsedData.products
				: [];

		const filteredProducts = categoryQuery
			? products.filter((product) => {
					const productCategory = (product.category || '').toString().toLowerCase();
					return productCategory === categoryQuery.toLowerCase();
				})
			: products;

		// Response: return the packaged JSON payload on success
		return res.status(200).json({ success: true, data: filteredProducts });
	} catch (error) {
		// Response: guard against file/parse errors without trusting client input
		return res.status(500).json({ success: false, error: 'Internal Server Error' });
	}
});

module.exports = router;
