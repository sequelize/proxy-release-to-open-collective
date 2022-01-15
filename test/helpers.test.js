const assert = require("assert");
const { sanitizeProjectName } = require("../src/helpers");

assert(sanitizeProjectName({ full_name: "sequelize/cli" }) === "Sequelize Cli");
assert(
  sanitizeProjectName({ full_name: "sequelize/sequelize" }) === "Sequelize"
);
