const Chapter = require("../models/Chapter");
const fs = require("fs");
const redisClient = require("../config/redis");

exports.getChapters = async (req, res) => {
  try {
    const {
      class: chapterClass,
      unit,
      status,
      weakChapters,
      subject,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    if (chapterClass) filter.class = chapterClass;
    if (unit) filter.unit = unit;
    if (status) filter.status = status;
    if (weakChapters !== undefined)
      filter.isWeakChapter = weakChapters === "true";
    if (subject) filter.subject = subject;

    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    };

    const cacheKey = JSON.stringify({ filter, options });
    const cachedChapters = await redisClient.get(cacheKey);
    if (cachedChapters) {
      console.log("Cache hit for getChapters");
      return res.status(200).json(JSON.parse(cachedChapters));
    }

    const chapters = await Chapter.find(filter)
      .skip(options.skip)
      .limit(options.limit);

    const totalChapters = await Chapter.countDocuments(filter);

    await redisClient.set(
      cacheKey,
      JSON.stringify({ chapters, totalChapters }),
      {
        EX: 3600 // Cache for 1 hour
      }
    );
    console.log("Cache miss, data set in cache for getChapters");

    res.status(200).json({ chapters, totalChapters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    res.status(200).json(chapter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.uploadChapters = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const chaptersToUpload = JSON.parse(fileContent);

    const uploadedChapters = [];
    const failedChapters = [];

    for (const chapterData of chaptersToUpload) {
      try {
        const chapter = new Chapter(chapterData);
        await chapter.save();
        uploadedChapters.push(chapterData);
      } catch (err) {
        failedChapters.push({ ...chapterData, error: err.message });
      }
    }

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Invalidate cache for all /api/v1/chapters queries after upload
    const keys = await redisClient.keys("*api/v1/chapters*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} cache keys for /api/v1/chapters`);
    }

    res.status(200).json({
      message: "Chapter upload process completed",
      uploadedCount: uploadedChapters.length,
      failedCount: failedChapters.length,
      failedChapters: failedChapters,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
