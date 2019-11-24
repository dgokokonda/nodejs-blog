const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // наименование папки
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 file -> 1mb = 1024+1024
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext != ".jpg" && ext != ".jpeg" && ext != ".png") {
      const err = new Error("Invalid Extension");
      err.code = "EXTENSION";
      return cb(err);
    }
    cb(null, true);
  }
}).single("image"); // имя инпута:file

router.post("/image", (req, res) => {
  upload(req, res, err => {
    let error = "";

    if (err) {
      if (err.code == "LIMIT_FILE_SIZE") {
        error = "Вес файла не более 1 Мб!";
      }

      if (err.code == "EXTENSION") {
        error = "Допустимы только расширения jpg, jpeg, png!";
      }
    }
    res.json({
      ok: !error,
      error
    });
  });
});

module.exports = router;
