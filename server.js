import express from 'express';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import userRoute from './routes/user.js';

const app = express();
const port = 3000;

app.use('/user', userRoute);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        text T
        completed BOOLEAN,
        isEditing BOOLEAN,
        createdDate TEXT,
        updatedDate TEXT
    )`);
});

app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });
});

app.post('/tasks', (req, res) => {
    const { text } = req.body;
    const newTask = {
        id: uuidv4(),
        text,
        completed: false,
        isEditing: false,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    };
    db.run(
        `INSERT INTO tasks (id, text, completed, isEditing, createdDate, updatedDate) VALUES (?, ?, ?, ?, ?, ?)`,
        [newTask.id, newTask.text, newTask.completed, newTask.isEditing, newTask.createdDate, newTask.updatedDate],
        (err) => {
            if (err) {
                res.status(500).send(err.message);
                return;
            }
            res.status(201).json(newTask);
        }
    );
});

app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed, isEditing } = req.body;
    const updatedDate = new Date().toISOString();
    db.run(
        `UPDATE tasks SET text = ?, completed = ?, isEditing = ?, updatedDate = ? WHERE id = ?`,
        [text, completed, isEditing, updatedDate, id],
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

app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tasks WHERE id = ?`, id, function (err) {
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
