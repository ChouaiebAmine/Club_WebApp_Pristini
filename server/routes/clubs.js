import express from 'express';
import Club from '../models/Club.js';
import { authMiddleware } from '../middleware/auth.js';
import User from "../models/User.js";
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
router.post('/:id/join', authMiddleware, async (req, res) => {

  const club = await Club.findById(req.params.id);

  if (!club) return res.status(404).json({ message: 'Club not found' });

  const user = await User.findById(req.user.userId);

  const alreadyMember = club.members.some(
    (m) => m.userId.toString() === user._id.toString()
  );

  if (alreadyMember)
    return res.status(400).json({ message: 'Already a member' });

  club.members.push({
    userId: user._id,
    role: 'member',
  });

  club.memberCount += 1;

  user.clubs.push({
    clubId: club._id,
    role: 'member',
  });

  await club.save();
  await user.save();

  res.json({ message: 'Joined club' });
});

router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const memberIndex = club.members.findIndex(
      (m) => m.userId.toString() === user._id.toString()
    );

    // ✅ NOT A MEMBER → ERROR (same behavior as join)
    if (memberIndex === -1) {
      return res.status(400).json({
        message: "You can't leave — you're not a member of this club",
      });
    }

    // remove from club
    club.members.splice(memberIndex, 1);

    // remove from user
    user.clubs = user.clubs.filter(
      (c) => c.clubId.toString() !== club._id.toString()
    );

    // safe decrement
    club.memberCount = Math.max(0, club.memberCount - 1);

    await club.save();
    await user.save();

    res.json({ message: "Left club successfully" });
  } catch (err) {
    console.error("leave club error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put('/:clubId/members/:memberId/role', authMiddleware, async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const { role } = req.body;

    const ALLOWED_ROLES = ['President', 'Treasurer', 'HR', 'Event Manager', 'Member'];

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // Verify the requester is the President
    if (club.presidentId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the president can assign roles' });
    }

    // Find the target member in the club's members array
    const member = club.members.find(m => m.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found in this club' });
    }

    // Prevent the president from demoting themselves accidentally
    if (member.userId.toString() === req.user.userId && role !== 'President') {
      return res.status(400).json({ message: 'President cannot demote themselves' });
    }

    // Update role in the Club model
    member.role = role;
    await club.save();

    // Also update the role in the User model's clubs array to keep data in sync
    const user = await User.findById(memberId);
    const userClub = user.clubs.find(c => c.clubId.toString() === clubId);
    if (userClub) {
      userClub.role = role;
      await user.save();
    }

    res.json({ message: 'Role updated successfully', member });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
export default router;
