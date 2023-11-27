const express = require(`express`)
const cors = require(`cors`)
const mongoose = require(`mongoose`)
const User = require('./Models/Users')
const dotenv = require(`dotenv`).config()
const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const cookieParser = require(`cookie-parser`)
const download = require(`image-downloader`)

const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecrete = `jsklhs45ureyfkjvnlxkjfksldeoueupiujh487fddgjn5934jdfhjk59jfdjf945kj`

const app = express()

app.use(
  cors({
    origin: `http://localhost:5173`,
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

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

app.get(`/users`, async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ mes: error.message })
  }
})

app.post(`/login`, async (req, res) => {
  const { email, password } = req.body
  const userDoc = await User.findOne({ email })
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password)
    if (passOk) {
      //generate a token of `emeail and password`
      jwt.sign(
        { email: userDoc.email, id: userDoc._id, name: userDoc.name },
        jwtSecrete,
        {},
        (err, token) => {
          if (err) throw err
          res.cookie(`token`, token).json(userDoc)
        }
      )
    } else {
      res.json(`Pass not ok `)
    }
  } else {
    res.json(`User not found`)
  }
})

app.get(`/profile`, (req, res) => {
  const { token } = req.cookies
  if (token) {
    jwt.verify(token, jwtSecrete, {}, (error, user) => {
      if (error) throw error
      //const {name, _id, email} = await User.findById(user.id)
      res.status(200).json(user)
    })
  } else {
    res.json(null)
  }
})

app.post(`/upload-link`, async (req, res) => {
  const { link } = req.body
  const newName = Date.now() + `jpg`

  await download.image({
    url: link,
    dest: __dirname + `/uploads/` + newName,
  })
  res.json({ dest })
})

app.post(`/logout`, (req, res) => {
  res.cookie('token', '').json(true)
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
