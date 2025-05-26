
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let keys = {};
let adminPassword = 'admin123';
let sessions = {};

app.post('/api/validate-key', (req, res) => {
  const { key } = req.body;
  res.json({ valid: !!keys[key] });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === adminPassword) {
    const token = Math.random().toString(36).substr(2);
    sessions[token] = true;
    res.json({ token });
  } else {
    res.json({ message: 'Invalid password' });
  }
});

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!sessions[token]) return res.status(403).json({ message: 'Unauthorized' });
  next();
}

app.post('/api/admin/create-key', auth, (req, res) => {
  const { key } = req.body;
  if (keys[key]) return res.json({ message: 'Key already exists' });
  keys[key] = true;
  res.json({ message: 'Key created' });
});

app.post('/api/admin/delete-key', auth, (req, res) => {
  const { key } = req.body;
  delete keys[key];
  res.json({ message: 'Key deleted' });
});

app.get('/api/admin/keys', auth, (req, res) => {
  res.json({ keys });
});

app.post('/api/admin/change-password', auth, (req, res) => {
  const { newPassword } = req.body;
  adminPassword = newPassword;
  res.json({ message: 'Password updated' });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
