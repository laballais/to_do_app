import express from 'express';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import helmet from 'helmet';

const app = express();
const port = 3000;
const secretKey = 'your_secret_key';

app.use(cors({ origin: 'http://localhost:5173' })); // Allow requests from your frontend origin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ 
    crossOriginResourcePolicy: false, 
    crossOriginEmbedderPolicy: false, 
}));

// Middleware to set CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('profilePicture');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Route to handle file upload
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      if (req.file == undefined) {
        res.status(400).send('No file selected!');
      } else {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
      }
    }
  });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

const db = new sqlite3.Database('./models/database.db');

// Database schema creation
db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Create tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        userId TEXT,
        text TEXT,
        completed BOOLEAN,
        isEditing BOOLEAN,
        createdDate TEXT,
        updatedDate TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);
});

// Middleware to authenticate user
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied. No token provided.');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(401).send('Invalid token.');
        req.user = decoded;
        next();
    });
};

// Signup route
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    db.run(
        `INSERT INTO users (id, username, password) VALUES (?, ?, ?)`,
        [userId, username, hashedPassword],
        (err) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            const token = jwt.sign({ id: userId, username }, secretKey);
            res.status(201).json({ token });
        }
    );
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).send(err.message);
        if (!user) return res.status(400).send('User not found.');

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(400).send('Invalid password.');

        const token = jwt.sign({ id: user.id, username: user.username }, secretKey);
        res.json({ token });
    });
});

// Get all tasks for authenticated user
app.get('/tasks', authenticate, (req, res) => {
    db.all(`SELECT * FROM tasks WHERE userId = ?`, [req.user.id], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });
});

// Add task for authenticated user
app.post('/tasks', authenticate, (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).send('Task text is required.');
    }
    const newTask = {
        id: uuidv4(),
        userId: req.user.id,
        text,
        completed: false,
        isEditing: false,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    };
    db.run(
        `INSERT INTO tasks (id, userId, text, completed, isEditing, createdDate, updatedDate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newTask.id, newTask.userId, newTask.text, newTask.completed, newTask.isEditing, newTask.createdDate, newTask.updatedDate],
        (err) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.status(201).json(newTask);
        }
    );
});

// Update task for authenticated user
app.put('/tasks/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { text, completed, isEditing } = req.body;
    if (!text) {
        return res.status(400).send('Task text is required.');
    }
    const updatedDate = new Date().toISOString();
    db.run(
        `UPDATE tasks SET text = ?, completed = ?, isEditing = ?, updatedDate = ? WHERE id = ? AND userId = ?`,
        [text, completed, isEditing, updatedDate, id, req.user.id],
        function (err) {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            if (this.changes === 0) {
                res.status(404).send('Task not found');
                return;
            }
            res.json({ id, text, completed, isEditing, updatedDate });
        }
    );
});

// Delete task for authenticated user
app.delete('/tasks/:id', authenticate, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ? AND userId = ?`, [id, req.user.id], function (err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        if (this.changes === 0) {
            res.status(404).send('Task not found');
            return;
        }
        res.status(204).send();
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
