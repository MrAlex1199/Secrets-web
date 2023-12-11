import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import encrypt from 'mongoose-encryption';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

const secret = "ThisisLittlesecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("User" , userSchema);

app.get('/', async function (req, res) {
  res.render('home.ejs');
});

app.get('/login', async function (req, res) {
  res.render('login.ejs');
});

app.get('/register', async function (req, res) {
  res.render('register.ejs');
});

app.post("/register", function (req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.redirect("/register");
    }
    const newUser = new User({ email: username, password: password });
    newUser.save()
        .then(() => {
            res.render("secrets.ejs");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
});

app.post("/login", async function (req, res) {
    const { username, password } = req.body;
    try {
        const foundUser = await User.findOne({ email: username });
        if (foundUser && foundUser.password === password) {
            res.render("secrets.ejs");
        } else {
            res.redirect("/login");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.listen(port, () => console.log(`Server running on port ${port}`));
