const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const app=express();
const authRoutes=require("./routes/auth.js")
const listingRoutes=require("./routes/listing.js")
const userRoutes=require("./routes/user.js")
const bookingRoutes = require("./routes/booking.js")
const message = require("./routes/messages.js")
const path = require('path');
const bodyParser=require("body-parser");
const cloudinary = require("cloudinary")
require("dotenv").config();
app.use(bodyParser.json({ limit: "Infinity" }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use("/auth",authRoutes)
app.use("/properties",listingRoutes)
app.use("/bookings", bookingRoutes)
app.use("/users",userRoutes)
app.use('/messages', message);
cloudinary.config({
  cloud_name: "duhadnqmh",
  api_key: "848465882823534",
  api_secret: "Y_3JPUnLtfQALfq2SGcuNDpi5do",
});
 const connectDb = async () => {
    try {
      const connectionInstance = await mongoose.connect("mongodb+srv://karanrawat914906:karan9149@clust.ifznd.mongodb.net/");
      console.log("mongoose connection successfull");
      app.listen(3032,()=>{
        console.log('server is running');
      })
    } catch (error) {
      console.log(error);
    }
  };
  
  connectDb();
// .catch((err)=>{
//     console.log("error occuring while connection mongoose",err)
// })