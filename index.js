const express = require(`express`)
const cors = require(`cors`)
const mongoose = require(`mongoose`)
const User = require('./Models/Users')
const dotenv = require(`dotenv`).config()

const app = express()

app.use(cors())
app.use(express.json())

app.post(`/`, (req, res) => {
  res.send(`Welcome to API`)
})
app.post(`/register`, async (req, res) => {
  await User.create(req.body)
  res.json(req.body)
})

const PORT = process.env.API_PORT || 4000
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`databsae connected`)
    app.listen(PORT, () => console.log(`Listening on port 4000`))
  })
  .catch((error) => console.log(error.message))
