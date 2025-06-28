const path = require('path');
const fs = require('fs');

// Helper function to load data from a JSON file
const loadData = (fileName) => {
  const filePath = path.join(__dirname, '../data/wearData', fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// GET all items from both men and women
const getWearItems = (req, res) => {
  try {
    const womenData = loadData('womenWear.json');
    const menData = loadData('menWear.json');
    const allData = [...womenData, ...menData];
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: 'Error reading wear data.' });
  }
};

// GET items by subcategory from both men and women
const getWearItemsBySubcategory = (req, res) => {
  const subcategory = req.params.subcategory.toLowerCase();

  try {
    const womenData = loadData('womenWear.json');
    const menData = loadData('menWear.json');
    const allData = [...womenData, ...menData];

    const filtered = allData.filter(
      item => item.subcategory.toLowerCase() === subcategory
    );

    if (filtered.length === 0) {
      return res.status(404).json({ message: 'No items found.' });
    }

    console.log("Requested subcategory:", subcategory);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Error filtering wear data.' });
  }
};

module.exports = {
  getWearItems,
  getWearItemsBySubcategory
};
