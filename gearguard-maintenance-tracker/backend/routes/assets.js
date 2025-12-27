const express = require('express');
const router = express.Router();
const assets = require('../db/assets');
const db = require('../db/database');

// Create asset
router.post('/', async (req, res) => {
  try {
    const created = await assets.createAsset(req.body);
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update asset
router.put('/:id', async (req, res) => {
  try {
    await assets.updateAsset(req.params.id, req.body);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Soft delete
router.delete('/:id', async (req, res) => {
  try {
    await assets.softDeleteAsset(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get list
router.get('/', async (req, res) => {
  try {
    const list = await assets.listAssets(req.query);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single
router.get('/:id', async (req, res) => {
  try {
    const row = await assets.getAssetById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
