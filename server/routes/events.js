import express from 'express';
import Event from '../models/Event.js';
import Club from '../models/Club.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all events for a club
router.get('/club/:clubId', async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.params.clubId })
      .populate('createdBy', 'name email')
      .populate('attendees.userId', 'name email');

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name')
      .populate('createdBy', 'name email')
      .populate('attendees.userId', 'name email')
      .populate('waitingList.userId', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Create a new event (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { clubId, title, description, date, location, maxAttendees } = req.body;

    // Verify club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const event = new Event({
      clubId,
      title,
      description,
      date,
      location,
      maxAttendees,
      createdBy: req.user.userId,
    });

    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Register for an event (requires authentication)
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already registered
    const isRegistered = event.attendees.some(
      (attendee) => attendee.userId.toString() === req.user.userId
    );

    if (isRegistered) {
      return res.status(400).json({ message: 'User already registered for this event' });
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      // Add to waiting list
      event.waitingList.push({
        userId: req.user.userId,
        position: event.waitingList.length + 1,
      });
    } else {
      // Add to attendees
      event.attendees.push({
        userId: req.user.userId,
        status: 'registered',
      });
    }

    await event.save();
    res.status(200).json({ message: 'Registered for event successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
});

// Check in to an event (requires authentication)
router.post('/:id/checkin', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendee = event.attendees.find(
      (a) => a.userId.toString() === req.user.userId
    );

    if (!attendee) {
      return res.status(404).json({ message: 'User not registered for this event' });
    }

    attendee.status = 'checked_in';
    attendee.checkedInAt = new Date();

    await event.save();
    res.status(200).json({ message: 'Checked in successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
});

// Cancel event registration (requires authentication)
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove from attendees
    event.attendees = event.attendees.filter(
      (a) => a.userId.toString() !== req.user.userId
    );

    // If there's a waiting list, move first person to attendees
    if (event.waitingList.length > 0) {
      const nextAttendee = event.waitingList.shift();
      event.attendees.push({
        userId: nextAttendee.userId,
        status: 'registered',
      });
    }

    await event.save();
    res.status(200).json({ message: 'Cancelled registration successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling registration', error: error.message });
  }
});

export default router;
