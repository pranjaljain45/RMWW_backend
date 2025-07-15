const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const getData = (fileName) => {
  const fullPath = path.join(__dirname, '..', 'data', 'wearData', fileName);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
};

router.get('/wear/women', (req, res) => {
  try {
    const data = getData('womenWear.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load women data' });
  }
});

router.get('/wear/men', (req, res) => {
  try {
    const data = getData('menWear.json');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load men data' });
  }
});

module.exports = router;
