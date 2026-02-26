import { Router } from "express"
import multer from "multer";
import { createBlog,getAllBlogs,updateBlog,deleteBlog,getSingleBlog} from "../controllers/blog.controller.js";
import {upload} from "../middleware/uploadMiddleware.js";


const router = Router();

// Middleware to handle multer errors for file upload
const handleUploadErrors = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File too big! Max 5MB."
      });
    }
    next(err); // pass other errors to Express
  });
};


// Create blog
router.post("/create-blog", handleUploadErrors, createBlog);

// Update blog with ID in URL
router.put("/update-blog/:id", handleUploadErrors, updateBlog);

// Get all blogs with optional pagination/search
router.get("/get-all-blogs", getAllBlogs);

// Get single blog by ID
router.get("/get-single-blog/:id", getSingleBlog);

// Delete blog with ID in URL
router.delete("/delete-blog/:id", deleteBlog);


export default router;