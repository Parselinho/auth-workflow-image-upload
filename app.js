require("dotenv").config();
require("express-async-errors");

const debug = require("debug")("app");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

const cors = require("cors");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const connectDB = require("./db/mongoose");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

const routes = require("./routes");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// app.use(express.static('./public'))
app.use(fileUpload({ useTempFiles: true }));

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(PORT, () => debug(`connected to database on port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
};

start();
