const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


const userChat = async (req, res
    ) => {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;
  
    try {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { fromId: currentUserId, toId: otherUserId },
            { fromId: otherUserId, toId: currentUserId },
          ],
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
  
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }


  module.exports = {
    userChat
  };