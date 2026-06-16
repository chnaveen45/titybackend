const mongoose = require("mongoose");
const Product = require("../models/Product");

const formatProduct = (product) => ({
  id: product._id,
  name: product.name,
  productName: product.name,
  category: product.category,
  price: product.price,
  stockQuantity: product.stockQuantity,
  status: product.status,
  description: product.description,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const formatValidationErrors = (error) =>
  Object.values(error.errors)
    .map((fieldError) => fieldError.message)
    .join(", ");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildProductPayload = (body) => {
  const payload = { ...body };

  if (body.productName !== undefined) {
    payload.name = body.productName;
    delete payload.productName;
  }

  return payload;
};

const createProduct = async (req, res) => {
  try {
    const payload = buildProductPayload(req.body);
    const { name, category, price, stockQuantity } = payload;

    if (!name || !category || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({
        message: "Name, category, price, and stock quantity are required",
      });
    }

    const product = await Product.create(payload);

    return res.status(201).json({
      message: "Product created successfully",
      product: formatProduct(product),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: formatValidationErrors(error) });
    }

    return res.status(500).json({ message: "Unable to create product" });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      products: products.map(formatProduct),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch products" });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product: formatProduct(product) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findByIdAndUpdate(id, buildProductPayload(req.body), {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: formatProduct(product),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: formatValidationErrors(error) });
    }

    return res.status(500).json({ message: "Unable to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product removed successfully",
      product: formatProduct(product),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to remove product" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
