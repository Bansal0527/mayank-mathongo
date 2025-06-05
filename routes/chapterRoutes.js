const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapterController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { isAdmin } = require("../middleware/authMiddleware");
const rateLimiter = require("../middleware/rateLimiter");

// Apply rate limiting to all routes
router.use(rateLimiter);

// GET all chapters
router.get("/", chapterController.getChapters);
// GET chapter by id
router.get("/:id", chapterController.getChapterById);
// POST upload chapters (admin only, file upload)
router.post(
  "/",
  isAdmin,
  upload.single("file"),
  chapterController.uploadChapters
);

module.exports = router;
