const express = require(`express`)
const cors = require(`cors`)
const mongoose = require(`mongoose`)
const User = require('./Models/Users')
const dotenv = require(`dotenv`).config()
const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)

const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecrete = `jsklhs45ureyfkjvnlxkjfksldeoueupiujh487fddgjn5934jdfhjk59jfdjf945kj`

const app = express()

app.use(cors())
app.use(express.json())

app.post(`/`, (req, res) => {
  res.send(`Welcome to API`)
})

app.post(`/register`, async (req, res) => {
  const { name, email, password } = req.body
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    })
    res.json(userDoc)
  } catch (error) {
    res.status(401).json(error)
  }
})

app.post(`/login`, async (req, res) => {
  const { email, password } = req.body
  const userDoc = User.findOne({ email })
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password)
    if (passOk) {
      jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecrete, {}, (err, token) => {
        if (err) throw err
        res.cookie(`token`, token).json(`Pass Ok`)
      })
    }
    res.json(`User found`)
  } else {
    res.json(`User not found`)
  }
})

app.get(`/users`, async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ mes: error.message })
  }
})

app.delete(`/users/:id`, async (req, res) => {
  try {
    let { id } = req.params
    const user = await User.findByIdAndDelete(id)
    if (!user) res.status(404).json(`User do not exist `)
    res.status(200).json(`Deleted successfully`)
  } catch (error) {
    res.status(400).json({ mes: error.message })
  }
})

const PORT = process.env.API_PORT || 4000
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`databsae connected`)
    app.listen(PORT, () => console.log(`Listening on port 4000`))
  })
  .catch((error) => console.log(error.message))
