const path = require("path");
// Import the path module to work with file paths

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Import the orders data from the specified file path

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");
// Import the nextId function from the specified file path

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

function bodyDataHas(propertyName) {
  // Factory function to generate middleware for validating the presence of a property in the data object
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Dish must include ${propertyName}.`,
    });
  };
}

function dishesPropertyIsValid(req, res, next) {
  // Middleware to validate that the dishes property in the data object is valid
  const { data: { dishes } } = req.body;
  if (Array.isArray(dishes) && dishes.length > 0) {
    next();
  } else {
    next({
      status: 400,
      message: "Order must include at least one dish.",
    });
  }
}

function quantityIsValid(req, res, next) {
  // Middleware to validate the quantity property of each dish in the data object
  const { data: { dishes } } = req.body;
  for (let i = 0; i < dishes.length; i++) {
    let quantity = dishes[i].quantity;
    if (!quantity || typeof quantity !== "number" || quantity < 1) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0.`,
      });
    }
  }
  next();
}

function validateOrderExists(req, res, next) {
  // Middleware to validate the existence of an order with the specified ID
  let { orderId } = req.params;
  orderId = orderId;
  let index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    let order = orders[index];
    res.locals.order = order;
    res.locals.index = index;
    next();
  } else {
    next({
      status: 404,
      message: `Could not find order with id ${orderId}`,
    });
  }
}

function validateStatus(req, res, next) {
  // Middleware to validate the status property of the order
  let { data: { status } } = req.body;
  if (status === "" || !status || status === "invalid") {
    next({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, or delivered.",
    });
  } else if (status === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed.",
    });
  } else {
    next();
  }
}

function deleteOrderExists(req, res, next) {
  // Middleware to validate the existence of an order with the specified ID for deletion
  let { orderId } = req.params;
  orderId = orderId;
  let index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    let order = orders[index];
    res.locals.order = order;
    res.locals.index = index;
    next();
  } else {
    next({
      status: 404,
      message: `Could not find order with id ${orderId}`,
    });
  }
}

function isPending(req, res, next) {
  // Middleware to check if the order is in the pending status for deletion
  let { status } = res.locals.order;
  if (status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  } else {
    next();
  }
}

// Routes 

function list(req, res, next) {
  // Handler for listing all orders
  res.send({ data: orders });
}

function create(req, res, next) {
  // Handler for creating a new order
  let { deliverTo, mobileNumber, dishes } = req.body.data;

  let newOrder = {
    deliverTo,
    mobileNumber,
    dishes,
    id: nextId(),
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function update(req, res, next) {
  // Handler for updating an existing order
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;

  res.json({ data: order });
}

function validateUpdateId(req, res, next) {
  // Middleware to validate that the updated order has the same ID
  const orderId = res.locals.order.id;
  const { data: { id } = {} } = req.body;

  if (!id || orderId === id) {
    next();
  } else {
    next({
      status: 400,
      message: `id: ${id} does not match`,
    });
  }
}

function read(req, res, next) {
  // Handler for reading a specific order
  const { order } = res.locals;
  res.send({ data: order });
}

function destroy(req, res, next) {
  // Handler for deleting an order
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    validateDataExists,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesPropertyIsValid,
    quantityIsValid,
    create,
  ],
  read: [
    validateOrderExists,
    read,
  ],
  update: [
    validateOrderExists,
    validateUpdateId,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesPropertyIsValid,
    quantityIsValid,
    validateStatus,
    update,
  ],
  delete: [
    deleteOrderExists,
    isPending,
    destroy,
  ],
};
