import {Chat} from "../../sequelize.js"
import { Op } from 'sequelize';

export const ChatRepository = {
    async updateMessagesStatus (chatId,status ){
        try {
            const chat=await Chat.update({
                status: status
            }, {
                where: {
                    id: chatId,
                }
            })
            const updatedChat=await Chat.findByPk(chatId);
            return updatedChat;
        } catch (error) {
            console.error("Error updating messages status:", error.message);
            throw error;
        }
    },
    async createNewChat(senderId,receiverId,message,status="sent"){
        try {
            const newChat = await Chat.create({
                senderId:senderId,
                receiverId:receiverId,
                message:message,
                status:status
            });
            return newChat;
        } catch (error) {
            console.error("Error creating chat:", error.message);
            throw error;
        }
    },
    async findExistingChats(senderId, receiverId) {
        try {
            const existingChats = await Chat.findAll({
                where: {
                    [Op.or]: [
                        { senderId: senderId, receiverId: receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                }
            });
            
            return existingChats;
        } catch (error) {
            console.error("Error finding existing chats:", error);
            throw new Error("Failed to find existing chats");
        }
    },
    async deleteChatBySenderId(chatId, senderId){
        try {
            // Find the chat message by chatId and senderId and delete it
            const deletedChat = await Chat.destroy({
                where: {
                    id: chatId,
                    senderId: senderId
                }
            });
    
            return deletedChat;
        } catch (error) {
            console.error("Error deleting chat:", error);
            throw new Error("Failed to delete chat");
        }
    },

    async updateTheChat(chatId, senderId, message){
        try {
            // Find the chat message by chatId and senderId and update it
            const updatedChat = await Chat.update(
                { message: message },
                {
                    where: {
                        id: chatId,
                        senderId: senderId
                    }
                }
            );

            const newUpdatedChat = await Chat.findOne({
                where: {
                    id: chatId,
                    senderId: senderId
                }
            });
    
            return newUpdatedChat;
        } catch (error) {
            console.error("Error updating chat:", error);
            throw new Error("Failed to update chat");
        }
    }
}