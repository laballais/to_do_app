import { useState, useEffect } from 'react';
import appLogo from '/checkmark.svg';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import './App.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState('');
    const [editTaskText, setEditTaskText] = useState('');

    useEffect(() => {
        fetchTasks();
        console.log("Fetched data")
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:3000/tasks');
            console.log('Fetched tasks:', response.data); // Debugging log
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleAddTask = async () => {
        console.log('Adding task'); // Debugging log
        if (task.trim() !== '') {
            try {
                const { data } = await axios.post('http://localhost:3000/tasks', { text: task });
                console.log('Added task:', data); // Debugging log
                setTask('');
                fetchTasks(); // Fetch updated list of tasks
            } catch (error) {
                console.error('Error adding task:', error);
            }
        } else {
            console.log('Task is empty'); // Debugging log
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/tasks/${id}`);
            console.log('Deleted task ID:', id); // Debugging log
            fetchTasks(); // Fetch updated list of tasks
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = (id, text) => {
        setEditTaskText(text);
        const newTasks = tasks.map((task) => (task.id === id ? { ...task, isEditing: true } : task));
        setTasks(newTasks);
    };

    const handleSaveTask = async (id) => {
        try {
            await axios.put(`http://localhost:3000/tasks/${id}`, { text: editTaskText, completed: false, isEditing: false });
            console.log('Saved task ID:', id); // Debugging log
            const newTasks = tasks.map((task) => (task.id === id ? { ...task, text: editTaskText, isEditing: false } : task));
            setTasks(newTasks);
            fetchTasks(); // Fetch updated list of tasks
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const handleToggleComplete = async (id) => {
        const task = tasks.find((task) => task.id === id);
        try {
            await axios.put(`http://localhost:3000/tasks/${id}`, { ...task, completed: !task.completed });
            console.log('Toggled complete task ID:', id); // Debugging log
            fetchTasks(); // Fetch updated list of tasks
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    };

    const handleSaveKeyPress = (e, id) => {
        if (e.key === 'Enter') {
            handleSaveTask(id);
        }
    };

    return (
        <>
            <div className="container mt-5">
                <div className="header d-flex align-items-center justify-content-center">
                    <a href="#">
                        <img src={appLogo} className="logo" alt="To Do App logo" />
                    </a>
                    <h1 className="ml-2">To Do App</h1>
                </div>
                <div className="form-inline mt-3">
                    <Form.Group className="mb-3 d-flex align-items-center" controlId="formToDo" style={{ width: '900px' }}>
                        <Form.Control
                            type="text"
                            placeholder="Write your to do here"
                            className="mr-2"
                            value={task}
                            onChange={(e) => setTask(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <Button variant="primary" type="button" onClick={() => {
                            console.log('Button clicked'); // Debugging log
                            handleAddTask();
                        }}>
                            +
                        </Button>
                    </Form.Group>
                </div>
                {tasks.length > 0 && (
                    <>
                        <hr className="mt-4" />
                        <h4 className="mt-4" style={{ textAlign: 'left' }}>To Do List:</h4>
                        <ul className="list-group mt-2">
                            {tasks.map((task) => (
                                <li
                                    key={task.id}
                                    className={`list-group-item d-flex align-items-center task-item ${task.completed ? 'completed-task' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={task.completed}
                                        onChange={() => handleToggleComplete(task.id)}
                                    />
                                    {task.isEditing ? (
                                        <Form.Control
                                            type="text"
                                            className="flex-grow-1 ml-2"
                                            value={editTaskText}
                                            onChange={(e) => setEditTaskText(e.target.value)}
                                            onKeyPress={(e) => handleSaveKeyPress(e, task.id)}
                                            autoFocus
                                        />
                                    ) : (
                                        <span
                                            className={`flex-grow-1 ml-2 ${task.completed ? 'completed' : ''}`}
                                            style={{ textAlign: 'left' }}
                                        >
                                            {task.text}
                                        </span>
                                    )}
                                    <div className="task-buttons ml-auto">
                                        {task.isEditing ? (
                                            <Button
                                                variant="primary"
                                                className="ml-2"
                                                onClick={() => handleSaveTask(task.id)}
                                                disabled={!task.isEditing}
                                            >
                                                Save
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="secondary"
                                                className="ml-2"
                                                onClick={() => handleEditTask(task.id, task.text)}
                                                disabled={task.completed}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        <Button
                                            variant="danger"
                                            className="ml-2 muted-red"
                                            onClick={() => handleDeleteTask(task.id)}
                                            disabled={task.completed || task.isEditing}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
            <style>{`
                .task-item {
                    position: relative;
                }
                .task-buttons {
                    display: flex;
                    margin-left: auto;
                }
                .task-item .flex-grow-1 {
                    margin-left: 10px;
                }
                .completed {
                    text-decoration: line-through;
                }
                .muted-red {
                    background-color: #e57373;
                    border-color: #e57373;
                }
            `}</style>
        </>
    );
}

export default App;
