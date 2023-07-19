const router = require("express").Router();
// Import the Router module from the Express library

const controller = require('./dishes.controller');
// Import the dishes controller module

const methodNotAllowed = require('../errors/methodNotAllowed');
// Import the methodNotAllowed error handling middleware

// TODO: Implement the /dishes routes needed to make the tests pass

router.route("/")
    // Define the route for the base URL ("/dishes")

    .get(controller.list)
    // Handle GET requests to list all dishes by calling the list method of the controller

    .post(controller.create)
    // Handle POST requests to create a new dish by calling the create method of the controller

    .all(methodNotAllowed);
    // Handle all other HTTP methods with the methodNotAllowed middleware

router.route("/:dishId")
    // Define the route for the URL pattern "/dishes/:dishId"
    // The :dishId is a route parameter that represents the ID of a specific dish

    .get(controller.read)
    // Handle GET requests to read a specific dish by calling the read method of the controller

    .put(controller.update)
    // Handle PUT requests to update a specific dish by calling the update method of the controller

    .all(methodNotAllowed);
    // Handle all other HTTP methods with the methodNotAllowed middleware

module.exports = router;
// Export the router module
