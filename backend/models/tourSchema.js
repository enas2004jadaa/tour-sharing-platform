const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], 
    videos: [{ type: String }], 
    location: { type: String, required: true }, 
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    category: {type: mongoose.Schema.Types.ObjectId,ref: "Category",required: true,},
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", tourSchema);