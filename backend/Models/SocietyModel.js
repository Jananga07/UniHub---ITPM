const mongoose = require("mongoose");

const CLUB_TYPES = [
  "Sports",
  "Activity",
  "Cultural",
  "Media",
  "International",
  "Religious",
];

const SocietySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    societyName: {
      type: String,
      trim: true,
      select: false,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    clubType: {
      type: String,
      required: true,
      enum: CLUB_TYPES,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.societyName = ret.name;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

SocietySchema.pre("validate", function syncLegacySocietyName() {
  if (this.name) {
    this.societyName = this.name;
  }
});

const Society = mongoose.model("Society", SocietySchema);

module.exports = Society;
module.exports.CLUB_TYPES = CLUB_TYPES;