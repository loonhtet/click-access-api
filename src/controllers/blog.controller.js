import { prisma } from "../config/db.js";
import paginate from "../utils/pagination.js";
import {uploadToCloudflare, deleteFromCloudflare, generateSignedUrl } from "../utils/cloudflare.js";

export const createBlog = async (req, res) => {
  let uploadedKey = null;

  try {
    const { title, content, tagIds } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        status: "error",
        message: "Title and content are required",
      });
    }

    let assetType = null;

    // Upload if file exists
    if (req.file) {
      uploadedKey = await uploadToCloudflare(req.file, "blogs/");

      if (req.file.mimetype.startsWith("image")) {
        assetType = "IMAGE";
      } else if (req.file.mimetype.startsWith("video")) {
        assetType = "VIDEO";
      }
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        userId: req.user.id,
        assetKey: uploadedKey,
        assetType,
        tags: tagIds?.length
          ? {
              connectOrCreate: tagIds.map(tagName => ({
                where: { title: tagName },
                create: { title: tagName },
              })),
            }
          : undefined,
      },
      include: {
      tags: true, 
    },
    });

    const assetUrl = blog.assetKey
      ? await generateSignedUrl(blog.assetKey)
      : null;

    res.status(201).json({
      status: "success",
      data: {
        ...blog,
        assetUrl,
      },
    });

  } catch (error) {
    // Cleanup if DB fails after upload
    if (uploadedKey) {
      await deleteFromCloudflare(uploadedKey);
    }

    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateBlog = async (req, res) => {
  let newUploadedKey = null;

  try {
    const { id } = req.params;
    const { title, content, tagIds, removeFile } = req.body;

    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    let assetKey = blog.assetKey;
    let assetType = blog.assetType;

    // Case 1: New file uploaded
    if (req.file) {
      newUploadedKey = await uploadToCloudflare(req.file, "blogs/");

      // delete old file
      if (blog.assetKey) {
        await deleteFromCloudflare(blog.assetKey);
      }

      assetKey = newUploadedKey;
      assetType = req.file.mimetype.startsWith("image")
        ? "IMAGE"
        : "VIDEO";
    }

    // Case 2: User removes file
    if (removeFile === "true" && blog.assetKey) {
      await deleteFromCloudflare(blog.assetKey);
      assetKey = null;
      assetType = null;
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title: title ?? blog.title,
        content: content ?? blog.content,
        assetKey,
        assetType,
        tags: tagIds?.length
          ? {
              set: [],
              connectOrCreate: tagIds.map(tagName => ({
                where: { title: tagName },
                create: { title: tagName },
              })),
            }
          : undefined,
      },
      include: {
      tags: true, 
    },
    });

    const assetUrl = updatedBlog.assetKey
      ? await generateSignedUrl(updatedBlog.assetKey)
      : null;

    res.status(200).json({
      status: "success",
      data: {
        ...updatedBlog,
        assetUrl,
      },
    });

  } catch (error) {
    // 🔥 Cleanup if upload succeeded but update failed
    if (newUploadedKey) {
      await deleteFromCloudflare(newUploadedKey);
    }

    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

     // Delete media from Cloudflare if it exists
    if (blog.assetKey) {
      await deleteFromCloudflare(blog.assetKey);
    }

    await prisma.blog.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    // 1. Optional filters from query (e.g., by user or tag)
    const { userId, tag } = req.query;

    const whereClause = {
      ...(userId && { userId }),
      ...(tag && {
        tags: {
          some: { title: tag },
        },
      }),
    };

    // 2. Use paginate helper
    const result = await paginate(prisma.blog, req, {
      where: whereClause,
      include: {
        tags: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Generate signed URLs for assetKey
    const blogsWithUrl = await Promise.all(
      result.data.map(async (blog) => {
        let assetUrl = null;
        if (blog.assetKey) {
          assetUrl = await generateSignedUrl(blog.assetKey);
        }
        return { ...blog, assetUrl };
      })
    );

    // 4. Return paginated response
    res.status(200).json({
      status: "success",
      data: blogsWithUrl,
      pagination: result.pagination,
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the blog with tags and user info
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
    }

    // Generate signed URL if blog has asset
    let assetUrl = null;
    if (blog.assetKey) {
      assetUrl = await generateSignedUrl(blog.assetKey);
    }

    res.status(200).json({
      status: "success",
      data: {
        ...blog,
        assetUrl,
      },
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};