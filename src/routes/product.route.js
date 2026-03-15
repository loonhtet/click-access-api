import { Router } from "express";
import {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  productSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";
import validate from "../utils/validate.js";

const productRouter = Router();

productRouter.get("/", getProducts);
productRouter.get("/:id", getSingleProduct);
productRouter.post("/", validate(productSchema), createProduct);
productRouter.put("/:id", validate(updateProductSchema), updateProduct);
productRouter.patch("/:id/toggle", toggleProductStatus);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
