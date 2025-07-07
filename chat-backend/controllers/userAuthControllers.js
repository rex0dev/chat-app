const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
  
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
        data: { name, email, password: hashedPassword }
    });
  
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Error registering user:', error);
    }
  }

  const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User not found' });
  
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid password' });
  
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  }

  module.exports = { registerUser, loginUser };
