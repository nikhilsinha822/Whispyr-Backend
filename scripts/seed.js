const mongoose = require('mongoose');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.models');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL);

const users = [
    '669a88b7d62d5059f73fa7f0',
    '669c18956218de88d752267a',
    '669ea17eb075be2b81c23460',
    '669a8e7a8e155c1ac6ffa329'
].map(id => mongoose.Types.ObjectId.createFromHexString(id));

const randomUser = () => users[Math.floor(Math.random() * users.length)];

const createConversation = async (index) => {
    const isGroup = Math.random() > 0.5;
    const participants = isGroup ? users : [users[0], users[1]];
    
    const conversation = new Conversation({
        name: isGroup ? `Group ${index + 1}` : `Conversation ${index + 1}`,
        participants: participants,
        type: isGroup ? 1 : 0,
        lastMessage: null // We'll update this after creating messages
    });

    await conversation.save();
    return conversation;
};

const createMessage = async (conversation, index) => {
    const sender = randomUser();
    const message = new Message({
        text: `Message ${index + 1} in ${conversation.name}`,
        sender,
        conversation: conversation._id,
        readBy: conversation.participants.map(userId => ({
            user: userId,
            status: Math.floor(Math.random() * 3),
            timestamp: new Date()
        }))
    });

    await message.save();
    return message;
};

const generateDummyData = async () => {
    for (let i = 0; i < 20; i++) {
        const conversation = await createConversation(i);
        let lastMessage;
        for (let j = 0; j < 20; j++) {
            lastMessage = await createMessage(conversation, j);
        }
        // Update lastMessage in the conversation
        conversation.lastMessage = lastMessage._id;
        await conversation.save();
        console.log(`Created conversation ${i + 1} with 20 messages`);
    }
    console.log('Dummy data generation completed');
    mongoose.connection.close();
};

generateDummyData().catch(console.error);