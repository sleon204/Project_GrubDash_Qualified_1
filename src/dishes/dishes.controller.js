const path = require("path");
// Import the path module to work with file paths

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Import the dishes data from the specified file path

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");
// Import the nextId function from the specified file path

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res, next) {
  // Handler for listing all dishes
  res.send({ data: dishes });
}

function create(req, res, next) {
  // Handler for creating a new dish
  const { data } = req.body;
  const { name, description, price, image_url } = data;
  const id = nextId();

  const dish = {
    id,
    name,
    description,
    price,
    image_url,
  };

  dishes.push(dish);

  res.status(201).json({ data: dish });
}

function read(req, res, next) {
  // Handler for reading a specific dish
  const { dish } = res.locals;
  res.send({ data: dish });
}

function update(req, res, next) {
  // Handler for updating a specific dish
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

function destroy(req, res, next) {
  // Handler for deleting a dish
  const { index } = res.locals;
  dishes.splice(index, 1);
  res.sendStatus(204);
}

// Middleware

function validateDataExists(req, res, next) {
  // Middleware to validate that the request body includes a data object
  if (req.body.data) {
    next();
  } else {
    next({
      status: 400,
      message: "Please include a data object in your request body.",
    });
  }
}

function fieldValidator(field) {
  // Factory function to generate middleware for validating the presence of a field in the data object
  return function (req, res, next) {
    if (req.body.data[field]) {
      if (field === "price" && (req.body.data[field] < 0 || typeof req.body.data[field] !== "number")) {
        next({
          status: 400,
          message: `Dish must include a valid ${field}.`,
        });
      } else {
        next();
      }
    } else {
      next({
        status: 400,
        message: `Dish must include a ${field}.`,
      });
    }
  };
}

function validateUpdateId(req, res, next) {
  // Middleware to validate that the updated dish has the same ID
  const dishId = res.locals.dish.id;
  const { data: { id } = {} } = req.body;

  if (!id || dishId === id) {
    next();
  } else {
    next({
      status: 400,
      message: `id: ${id} does not match.`,
    });
  }
}

function validateDishExists(req, res, next) {
  // Middleware to validate the existence of a dish with the specified ID
  let { dishId } = req.params;
  dishId = dishId;
  let index = dishes.findIndex((dish) => dish.id === req.params.dishId);
  if (index > -1) {
    let dish = dishes[index];
    res.locals.dish = dish;
    res.locals.index = index;
    next();
  } else {
    next({
      status: 404,
      message: `Could not find dish with id ${dishId}.`,
    });
  }
}

function deleteDishExists(req, res, next) {
  // Middleware to validate the existence of a dish with the specified ID for deletion
  let { dishId } = req.params;
  dishId = dishId;
  let index = dishes.findIndex((dish) => dish.id === req.params.dishId);
  if (index > -1) {
    let dish = dishes[index];
    res.locals.dish = dish;
    res.locals.index = index;
    next({ status: 405 });
  } else {
    next({
      status: 405,
      message: `Could not find dish with id ${dishId}.`,
    });
  }
}

let fields = ["name", "description", "price", "image_url"];

module.exports = {
  list,
  create: [
    validateDataExists,
    ...fields.map(fieldValidator),
    create,
  ],
  read: [
    validateDishExists,
    read,
  ],
  update: [
    validateDishExists,
    validateUpdateId,
    ...fields.map(fieldValidator),
    update,
  ],
  destroy: [
    deleteDishExists,
    destroy,
  ],
};
