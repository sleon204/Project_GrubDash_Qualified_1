const router = require('express').Router();
// Import the Router module from the Express library

const controller = require('./orders.controller');
// Import the orders controller module

const methodNotAllowed = require('../errors/methodNotAllowed');
// Import the methodNotAllowed error handling middleware

// TODO: Implement the /orders routes needed to make the tests pass

router
	.route('/')
	// Define the route for the base URL ("/orders")

	.get(controller.list)
	// Handle GET requests to list all orders by calling the list method of the controller

	.post(controller.create)
	// Handle POST requests to create a new order by calling the create method of the controller

	.all(methodNotAllowed);
// Handle all other HTTP methods with the methodNotAllowed middleware

router
	.route('/:orderId')
	// Define the route for the URL pattern "/orders/:orderId"
	// The :orderId is a route parameter that represents the ID of a specific order

	.get(controller.read)
	// Handle GET requests to read a specific order by calling the read method of the controller

	.put(controller.update)
	// Handle PUT requests to update a specific order by calling the update method of the controller

	.delete(controller.delete)
	// Handle DELETE requests to delete a specific order by calling the delete method of the controller

	.all(methodNotAllowed);
// Handle all other HTTP methods with the methodNotAllowed middleware

module.exports = router;
// Export the router module
