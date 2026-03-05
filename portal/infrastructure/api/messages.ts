import { api } from './client'
import { API_ENDPOINTS } from '~/constants/api'
import type { Conversation, Message } from '~/types/user'
import type { PaginatedResponse } from '~/types/common'

export const messagesApi = {
  getConversations(params?: Record<string, any>): Promise<PaginatedResponse<Conversation>> {
    return api.get(API_ENDPOINTS.MESSAGES.CONVERSATIONS, params)
  },

  getConversation(id: string): Promise<Conversation> {
    return api.get(API_ENDPOINTS.MESSAGES.CONVERSATION(id))
  },

  createConversation(data: Record<string, any>): Promise<Conversation> {
    return api.post(API_ENDPOINTS.MESSAGES.CONVERSATIONS, data)
  },

  getMessages(conversationId: string, params?: Record<string, any>): Promise<PaginatedResponse<Message>> {
    return api.get(API_ENDPOINTS.MESSAGES.MESSAGES(conversationId), params)
  },

  sendMessage(conversationId: string, data: { content: string }): Promise<Message> {
    return api.post(API_ENDPOINTS.MESSAGES.SEND(conversationId), data)
  },

  markAsRead(messageId: string): Promise<void> {
    return api.put(API_ENDPOINTS.MESSAGES.MARK_READ(messageId))
  },

  deleteMessage(messageId: string): Promise<void> {
    return api.delete(API_ENDPOINTS.MESSAGES.DELETE_MESSAGE(messageId))
  },

  archiveConversation(conversationId: string): Promise<void> {
    return api.post(API_ENDPOINTS.MESSAGES.ARCHIVE(conversationId))
  },

  deleteConversation(conversationId: string): Promise<void> {
    return api.delete(API_ENDPOINTS.MESSAGES.CONVERSATION(conversationId))
  },

  getUnreadCount(): Promise<{ count: number }> {
    return api.get(API_ENDPOINTS.MESSAGES.UNREAD_COUNT)
  },
}
