const router = require("express").Router();
const multer = require("multer");
const cloudinary=require("cloudinary")
const Listing = require("../models/Listing");
const User = require("../models/User")

/* Configuration Multer for File Upload */
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Use the original file name
//   },
// });
// const storage = multer.memoryStorage(); 
const upload = multer({
  storage:  multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
      },
    }),
  limits: {
    fileSize: 50 * 1024 * 1024, // Set to 50MB or adjust as needed
    fieldSize: 50 * 1024 * 1024, // Adjust field size limit if needed
  },
});

router.post("/create", async (req, res) => {
  try {
    const { formFields, listingPhotos } = req.body;

    console.log("Received form fields:", formFields);
    console.log("Received listing photos:", listingPhotos);

    // Validate if listingPhotos were received
    if (!listingPhotos || listingPhotos.length === 0) {
      console.log("No photos uploaded");
      return res.status(400).send("No photos uploaded.");
    }

    // Upload each photo to Cloudinary
    const uploadPromises = listingPhotos.map(async (photo) => {
      return cloudinary.uploader.upload(photo, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
    });

    const uploadedPhotoUrls = await Promise.all(uploadPromises);

    // Create a new listing with uploaded photo URLs
    const newListing = new Listing({
      ...formFields, // Spread form fields
      listingPhotoPaths: uploadedPhotoUrls.map((result) => result.url),
    });

    // Save the listing to the database
    await newListing.save();

    res.status(201).json(newListing);
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ message: "Failed to create listing", error: err.message });
  }
});



/* GET lISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category

  try {
    let listings
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate("creator")
    } else {
      listings = await Listing.find().populate("creator")
    }

    res.status(200).json(listings)
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch listings", error: err.message })
    console.log(err)
  }
})

/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params

  try {
    let listings = []

    if (search === "all") {
      listings = await Listing.find().populate("creator")
    } else {
      listings = await Listing.find({
        $or: [
          { category: {$regex: search, $options: "i" } },
          { title: {$regex: search, $options: "i" } },
        ]
      }).populate("creator")
    }

    res.status(200).json(listings)
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch listings", error: err.message })
    console.log(err)
  }
})

/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params
    const listing = await Listing.findById(listingId).populate("creator")
    res.status(202).json(listing)
  } catch (err) {
    res.status(404).json({ message: "Listing can not found!", error: err.message })
  }
})

module.exports = router