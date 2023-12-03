const express = require(`express`)
const cors = require(`cors`)
const mongoose = require(`mongoose`)
const User = require('./Models/Users')
const Place = require(`./Models/places`)
const dotenv = require(`dotenv`).config()
const bcrypt = require(`bcryptjs`)
const jwt = require(`jsonwebtoken`)
const cookieParser = require(`cookie-parser`)
const download = require(`image-downloader`)
const multer = require(`multer`)
const fs = require(`fs`)

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
//to be able to view images on the browser/client
app.use('/uploads', express.static(__dirname + `/uploads`))

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

app.post(`/upload-link`, async (req, res) => {
  const { link } = req.body
  const newName = `photo` + Date.now() + `.jpg`

  await download.image({
    url: link,
    dest: __dirname + `/uploads/` + newName,
  })
  res.json(newName)
})

const uploadMiddleware = multer({ dest: `uploads/` })
app.post(`/uploads`, uploadMiddleware.array(`photos`, 100), (req, res) => {
  let uploadedFiles = []
  for (let i in req.files) {
    const { path, originalname } = req.files[i]
    const parts = originalname.split(`.`)
    const ext = parts[parts.length - 1]
    const newPath = path + `.` + ext
    fs.renameSync(path, newPath)
    uploadedFiles.push(newPath.replace(`uploads\\`, ``))
  }
  res.json(uploadedFiles)
})

app.post(`/places`, (req, res) => {
  const { token } = req.cookies
  const { title, address, addPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests } =
    req.body
  jwt.verify(token, jwtSecrete, {}, async (err, user) => {
    if (err) throw err
    const placeDoc = await Place.create({
      owner: user.id,
      title,
      address,
      photos: addPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    })
    res.status(200).json(placeDoc)
  })
})

app.get(`/placelist`, async (req, res) => {
  const { token } = req.cookies
  jwt.verify(token, jwtSecrete, {}, async (err, user) => {
    if (err) throw err
    const allplaces = await Place.find({ owner: user.id })
    res.json(allplaces)
  })
})

app.get(`/places/:id`, async (req, res) => {
  const { id } = req.params
  const userDoc = await Place.findById(id)
  res.json(userDoc)
})

app.put(`/places`, async (req, res) => {
  const { token } = req.cookies
  const {
    id,
    title,
    address,
    addPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body
  jwt.verify(token, jwtSecrete, {}, async (err, user) => {
    const placeDoc = await Place.findById(id)
    if (err) throw err
    if (placeDoc.owner.toString() === user.id) {
      placeDoc.set({
        title,
        address,
        photos: addPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
      })
      await placeDoc.save()
      res.json(`ok`)
    }
  })
})

const PORT = process.env.API_PORT || 4000
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log(`databsae connected`)
    app.listen(PORT, () => console.log(`Listening on port 4000`))
  })
  .catch((error) => console.log(error.message))
