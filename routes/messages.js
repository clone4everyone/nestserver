// routes/messages.js
const express = require("express");
const router = express.Router();
const Message = require("../models/MessageModel");

router.post("/create", async (req, res) => {
  try {
    const { propertyId, customerId, hostId, messageContent } = req.body;

    const newMessage = new Message({
      propertyId,
      customerId,
      hostId,
      messageContent,
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// routes/messages.js

// routes/messages.js

router.get("/", async (req, res) => {
  const { hostId } = req.query; // Get hostId from query parameters

  try {
    const messages = await Message.find({ hostId })
      .populate("customerId", "firstname email profileImagepath") // Populate customer details
      .populate("propertyId", "title") // Populate listing title
      .sort({ createdAt: -1 }); // Sort messages by latest first

    // Group messages by customer
    const groupedMessages = messages.reduce((acc, msg) => {
      const key = msg.customerId._id.toString();
      if (!acc[key]) {
        acc[key] = {
          customer: msg.customerId,
          messages: [],
        };
      }
      acc[key].messages.push(msg);
      return acc;
    }, {});

    res.status(200).json(Object.values(groupedMessages));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});




module.exports = router;
