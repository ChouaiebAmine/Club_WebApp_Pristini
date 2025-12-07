import express from 'express';
import Club from '../models/Club.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all clubs with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const clubs = await Club.find(query).populate('presidentId', 'name email');
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clubs', error: error.message });
  }
});

// Get a single club by ID
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('presidentId', 'name email')
      .populate('members.userId', 'name email phone');

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.status(200).json(club);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching club', error: error.message });
  }
});

// Create a new club (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, color, meetingSchedule } = req.body;

    const club = new Club({
      name,
      description,
      category,
      color,
      meetingSchedule,
      presidentId: req.user.userId,
      members: [
        {
          userId: req.user.userId,
          role: 'president',
        },
      ],
      memberCount: 1,
    });

    await club.save();
    res.status(201).json({ message: 'Club created successfully', club });
  } catch (error) {
    res.status(500).json({ message: 'Error creating club', error: error.message });
  }
});

// Update a club (requires authentication)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is president
    if (club.presidentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only club president can update club' });
    }

    const { name, description, category, color, meetingSchedule } = req.body;

    club.name = name || club.name;
    club.description = description || club.description;
    club.category = category || club.category;
    club.color = color || club.color;
    club.meetingSchedule = meetingSchedule || club.meetingSchedule;
    club.updatedAt = Date.now();

    await club.save();
    res.status(200).json({ message: 'Club updated successfully', club });
  } catch (error) {
    res.status(500).json({ message: 'Error updating club', error: error.message });
  }
});

// Delete a club (requires authentication)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is president
    if (club.presidentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only club president can delete club' });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting club', error: error.message });
  }
});

export default router;
