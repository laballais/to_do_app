// routes/users.js
// const express = require('express');
import express from 'express';
const router = express.Router();

// Define a route
router.get('/', (req, res) => {
    res.send('Get request to homepage');// this gets executed when user visit http://localhost:3000/todo
});

router.post('/', (req, res) => {
    res.send('POST request to homepage')
  })

router.put('/', (req, res) => {
    res.send('PUT request to homepage')
})

router.delete('/', (req, res) => {
    res.send('DELETE request to homepage')
  })
// export the router module so that server.js file can use it
// module.exports = router;
export default router;