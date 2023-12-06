import { Schema, model } from 'mongoose'

const bookingSchema = new Schema({
  place: { type: mongoose.Schema.Types.ObjectId, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: truen },
  maxGuest: { type: Number, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  price: Number,
  amount: Number,
})

const Booking = model(`Booking`, bookingSchema)

module.exports = Booking
