import { Router, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getChatById,
  getChatsForUser,
  getMessages,
  addMessage,
} from '../services/chatService.js';
import { sendChatMessageSchema } from '../validators/schemas.js';
import { asyncRoute } from '../utils/asyncRoute.js';

const router = Router();

router.use(requireAuth);

async function getAuthorizedChat(chatId: string, uid: string, res: Response) {
  const chat = await getChatById(chatId);
  if (!chat) {
    res.status(404).json({ error: 'Chat not found' });
    return null;
  }
  if (!chat.participantIds.includes(uid)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return chat;
}

router.get(
  '/',
  asyncRoute(async (req, res) => {
    const chats = await getChatsForUser(req.user!.uid);
    res.json(chats);
  })
);

router.get(
  '/:chatId',
  asyncRoute(async (req, res) => {
    const chat = await getAuthorizedChat(req.params.chatId, req.user!.uid, res);
    if (!chat) return;
    res.json(chat);
  })
);

router.get(
  '/:chatId/messages',
  asyncRoute(async (req, res) => {
    const chat = await getAuthorizedChat(req.params.chatId, req.user!.uid, res);
    if (!chat) return;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 100, 200);
    const messages = await getMessages(req.params.chatId, limit);
    res.json(messages);
  })
);

router.post(
  '/:chatId/messages',
  asyncRoute(async (req, res) => {
    const chat = await getAuthorizedChat(req.params.chatId, req.user!.uid, res);
    if (!chat) return;
    const parsed = sendChatMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    }
    const message = await addMessage(
      req.params.chatId,
      req.user!.uid,
      parsed.data.content,
      'text'
    );
    res.status(201).json(message);
  })
);

export default router;
