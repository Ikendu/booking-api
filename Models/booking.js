const { Schema, model } = require('mongoose')

const bookingSchema = new Schema(
  {
    placeId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    maxGuests: { type: Number, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    price: Number,
    amount: Number,
  },
  { timestamps: true }
)

const Booking = model(`Booking`, bookingSchema)

module.exports = Booking
