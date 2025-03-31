import Message from '../models/Message.js';
import EarbudListing from '../models/EarbudListing.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, listingId, content } = req.body;

    // Verify that the listing exists and the receiver is the owner
    const listing = await EarbudListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.user.toString() !== receiverId) {
      return res.status(403).json({ message: 'Invalid receiver' });
    }

    // Create new message
    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      listingId,
      content
    });

    await message.save();

    // Emit socket event for real-time chat
    req.app.get('io').to(receiverId).emit('newMessage', message);

    res.status(201).json({
      message: 'Message sent successfully',
      message
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user.id },
            { receiver: req.user.id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user.id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user.id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId, listingId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ],
      listingId
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name profilePicture')
    .populate('receiver', 'name profilePicture');

    // Mark messages as read
    await Message.updateMany(
      {
        receiver: req.user.id,
        sender: userId,
        listingId,
        isRead: false
      },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    message.isRead = true;
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
}; 