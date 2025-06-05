require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

connectDB();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const chapterRoutes = require("./routes/chapterRoutes");
app.use("/api/v1/chapters", chapterRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("server running ar port 3000");
});
