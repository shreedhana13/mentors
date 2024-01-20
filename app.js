// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mentorship', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Mentor and Student models
const Mentor = mongoose.model('Mentor', { name: String });
const Student = mongoose.model('Student', { name: String, mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' } });

app.use(bodyParser.json());

// API to create Mentor
app.post('/api/mentors', async (req, res) => {
  const mentor = new Mentor(req.body);
  await mentor.save();
  res.json(mentor);
});

// API to create Student
app.post('/api/students', async (req, res) => {
  const student = new Student(req.body);
  await student.save();
  res.json(student);
});

// API to Assign a student to Mentor
app.put('/api/assign-mentor/:mentorId/:studentId', async (req, res) => {
  const { mentorId, studentId } = req.params;
  const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
  res.json(student);
});

// API to show all students for a particular mentor
app.get('/api/mentor-students/:mentorId', async (req, res) => {
  const { mentorId } = req.params;
  const students = await Student.find({ mentor: mentorId });
  res.json(students);
});

// API to show the previously assigned mentor for a particular student
app.get('/api/student-mentor/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const student = await Student.findById(studentId).populate('mentor');
  res.json(student.mentor);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
