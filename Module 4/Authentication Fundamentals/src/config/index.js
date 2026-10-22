require('dotenv').config();

const parsedCostFactor = Number.parseInt(process.env.BCRYPT_COST_FACTOR || '10', 10);

module.exports = Object.freeze({
  port: Number.parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  bcryptCostFactor: Number.isInteger(parsedCostFactor) && parsedCostFactor >= 4 && parsedCostFactor <= 31
    ? parsedCostFactor
    : 10
});
