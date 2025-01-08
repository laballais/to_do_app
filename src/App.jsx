import { useState, useEffect, useCallback } from 'react';
import { BsFillPersonFill } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import appLogo from '/checkmark.svg';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import './App.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState('');
    const [editTaskText, setEditTaskText] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:3000/tasks', { headers: { Authorization: token } });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, [token]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchTasks();
        }
    }, [isLoggedIn, fetchTasks]);

    const handleAddTask = async () => {
        if (task.trim() !== '') {
            try {
                await axios.post('http://localhost:3000/tasks', { text: task }, { headers: { Authorization: token } });
                setTask('');
                fetchTasks();
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/tasks/${id}`, { headers: { Authorization: token } });
            fetchTasks();
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
            await axios.put(`http://localhost:3000/tasks/${id}`, { text: editTaskText, completed: false, isEditing: false }, { headers: { Authorization: token } });
            fetchTasks();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const handleToggleComplete = async (id) => {
        const task = tasks.find((task) => task.id === id);
        try {
            await axios.put(`http://localhost:3000/tasks/${id}`, { ...task, completed: !task.completed }, { headers: { Authorization: token } });
            fetchTasks();
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

    const handleSignup = async () => {
        try {
            const response = await axios.post('http://localhost:3000/signup', { username, password });
            setToken(response.data.token);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Error signing up:', error);
            alert('Signup failed. Username already exists.');
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3000/login', { username, password });
            setToken(response.data.token);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Login failed. Please check your username and password.');
        }
    };

    const handleLogout = () => {
        setToken('');
        setIsLoggedIn(false);
        setTasks([]);
    };

    const handleProfilePictureUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await axios.post('http://localhost:3000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token,
                },
            });
            setProfilePicture(response.data.url);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="container mt-5">
                <div className="header d-flex align-items-center justify-content-center">
                    <a href="#">
                        <img src={appLogo} className="logo" alt="To Do App logo" />
                    </a>
                    <h1 className="ml-2">To Do App</h1>
                </div>
                <div className="form-inline mt-3">
                    <Form.Group className="mb-3 d-flex align-items-center" controlId="formUsername">
                        <Form.Control type="text" placeholder="Username" className="mr-2" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex align-items-center" controlId="formPassword">
                        <Form.Control type="password" placeholder="Password" className="mr-2" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </Form.Group>
                    <Button variant="primary" onClick={handleLogin}>Login</Button>
                    <Button variant="secondary" onClick={handleSignup}>Signup</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container mt-5">
                <div className="logout-container d-flex justify-content-end align-items-center mb-2">
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="profilePictureInput"
                        onChange={handleProfilePictureUpload}
                    />
                        <Button variant="outlined" className="mr-0" onClick={() => document.getElementById('profilePictureInput').click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {profilePicture ? <img src={profilePicture} alt="Profile" className="profile-picture" style={{ marginRight: '5px' }} /> : <BsFillPersonFill className="mr-1" />}
                            {username}
                        </Button>
                        <Button variant="outlined" className="ml-0" onClick={handleLogout}>
                            <TbLogout className="mr-1" />
                        </Button>
                </div>
                <div className="header-container d-flex align-items-center justify-content-center">
                    <div className="header d-flex align-items-center">
                        <a href="#">
                            <img src={appLogo} className="logo" alt="To Do App logo" />
                        </a>
                        <h1 className="ml-2">To Do App</h1>
                    </div>
                </div>
                <div className="form-inline mt-3">
                    <Form.Group className="mb-3 d-flex align-items-center" controlId="formToDo" style={{ width: '900px' }}>
                        <Form.Control type="text" placeholder="Write your to do here" className="mr-2" value={task} onChange={(e) => setTask(e.target.value)} onKeyPress={handleKeyPress} />
                        <Button variant="primary" type="button" onClick={handleAddTask}>+</Button>
                    </Form.Group>
                </div>
                {tasks.length > 0 && (
                    <>
                        <hr className="mt-4" />
                        <h4 className="mt-4" style={{ textAlign: 'left' }}>To Do List:</h4>
                        <ul className="list-group mt-2">
                            {tasks.map((task) => (
                                <li key={task.id} className={`list-group-item d-flex align-items-center task-item ${task.completed ? 'completed-task' : ''}`}>
                                    <input type="checkbox" className="mr-2" checked={task.completed} onChange={() => handleToggleComplete(task.id)} />
                                    {task.isEditing ? (
                                        <Form.Control type="text" className="flex-grow-1 ml-2" value={editTaskText} onChange={(e) => setEditTaskText(e.target.value)} onKeyPress={(e) => handleSaveKeyPress(e, task.id)} autoFocus />
                                    ) : (
                                        <span className={`flex-grow-1 ml-2 ${task.completed ? 'completed' : ''}`} style={{ textAlign: 'left' }}>
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
                .header-container {
                    position: relative;
                }
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
                .profile-picture {
                    width: 1em; /* Adjust the size to match the icon */
                    height: 1em; /* Adjust the size to match the icon */
                    border-radius: 50%; /* Optional: to make the image circular */
                }
            `}</style>
        </>
    );   
}

export default App;
