const mongoose = require(`mongoose`)
const { Schema, model } = mongoose

const PlaceSchema = new Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: `User` },
  title: String,
  address: String,
  photos: [String],
  description: String,
  perks: [String],
  extraInfo: String,
  checkIn: Number,
  checkOut: Number,
  maxGuest: Number,
  price: Number,
})

const Place = model(`Places`, PlaceSchema)

module.exports = Place
