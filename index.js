const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors')
const imageThumbnail = require("image-thumbnail");


app.use(cors())
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use(bodyParser.json({ limit: "600mb" }));
app.use(bodyParser.urlencoded({limit: '600mb', extended: true}));

dotenv.config();
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// const connection = mongoose.createConnection(process.env.MONGO_URL_ATLAS)

const schema = new mongoose.Schema({ filename: "string", type: "string", thumb:"array" });
const Image = mongoose.model("Image", schema);
app.get("/fetchimages", async (req, res) => {
  try {
    const images = await Image.find().sort("-filename");
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json(err);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.array("file"), async (req, res) => {

    const newImage = new Image({
      filename: req.body.name,
      type: req.body.type
    });
    try {
      await newImage.save();
    } catch (err) {
      console.log(err);
    }
      res.status(200).json("File has been uploaded");

});

app.listen();
