const { errorResponse } = require("../utils/apiResponse");

/**
 * Middleware factory for Joi schema validation.
 * @param {Object} schema - Joi schema
 * @param {string} source - 'body' | 'query' | 'params'
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      }));
      return errorResponse(res, 422, "Validation failed", errors);
    }

    req[source] = value;
    next();
  };
};

module.exports = { validate };
