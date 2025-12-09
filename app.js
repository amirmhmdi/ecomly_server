const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const authJwt = require("./middlewares/jwt");
const authorizationPostRequests = require("./middlewares/authorization");
const errorHandler = require("./middlewares/error_handler");
require("dotenv/config")

const app = express();
const env = process.env;
const apiVersion = env.API_URL;

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
// app.options("*", cors());
app.use(authJwt());
app.use(authorizationPostRequests);
app.use(errorHandler);

const authrouter = require("./router/auth");
const usersRouter = require("./router/users");
const adminRouter = require("./router/admin");
const categoriesRouter = require("./router/categories");
const productsRouter = require("./router/products");
const checkoutRouter = require("./router/checkout");
const ordersRouter = require("./router/orders");

app.use(`${apiVersion}/`, authrouter);
app.use(`${apiVersion}/users`, usersRouter);
app.use(`${apiVersion}/admin`, adminRouter);
app.use(`${apiVersion}/categories`, categoriesRouter);
app.use(`${apiVersion}/products`, productsRouter);
app.use(`${apiVersion}/checkout`, checkoutRouter);
app.use(`${apiVersion}/orders`, ordersRouter);
app.use('/public', express.static(__dirname + '/public'));

//start server
const hostname = env.HOST;
const port = env.PORT;

require("./helper/cron_job");

mongoose.connect(env.MONGO_DB_CONNECTION_STRING).then(() => console.log("MongoDB connected")).catch(err => console.error(err));

app.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}`);
});