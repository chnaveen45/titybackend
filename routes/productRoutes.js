const express = require("express");
const {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} = require("../controllers/productController");

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
