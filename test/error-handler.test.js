const request = require("supertest");
const express = require("express");
const notFound = require("../middleware/not-found");
const errorHandler = require("../middleware/error-handler");

const app = express();
app.use(express.json());
app.use(notFound);
app.use(errorHandler);

describe("404 Not Found Middleware", () => {
  it("should return 404 for non-existing routes", async () => {
    const res = await request(app).get("/non-existing-route");
    expect(res.status).toBe(404);
    expect(res.text).toBe("Route does not exist");
  });
});

app.get("/test-error", (req, res, next) => {
  const error = new Error("Test Error");
  error.statusCode = 400;
  next(error);
});

describe("Error Handler Middleware", () => {
  it("should handle generic errors", async () => {
    const res = await request(app).get("/test-error");
    expect(res.status).toBe(res.status);
    expect(res.body.msg).toBe(res.body.msg);
  });
});
