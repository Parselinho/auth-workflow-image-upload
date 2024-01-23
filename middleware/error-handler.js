const errorHandler = (err, req, res, next) => {
  let customErr = {
    statusCode: err.statusCode || 500,
    msg: err.message || "Something went wrong, try again later",
  };
  if (err.name === "ValidationError") {
    customErr.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
    customErr.statusCode = 400;
  }
  if (err.code && err.code === 11000) {
    customErr.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customErr.statusCode = 400;
  }
  if (err.name === "CastError") {
    customErr.msg = `No item found with id : ${err.value}`;
    customErr.statusCode = 404;
  }
  return res.status(customErr.statusCode).json({ msg: customErr.msg });
};

module.exports = errorHandler;
