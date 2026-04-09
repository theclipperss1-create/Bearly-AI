// Firestore functions
import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore'

export interface Chat {
  id: string
  title: string
  userId: string
  createdAt: any
  updatedAt: any
}

export async function createChat(userId: string, title: string): Promise<string> {
  if (!db) return 'local-' + Date.now()

  try {
    const chatRef = await addDoc(collection(db, 'chats'), {
      userId,
      title,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return chatRef.id
  } catch (error) {
    console.error('Error creating chat:', error)
    return 'local-' + Date.now()
  }
}

export async function saveMessage(chatId: string, role: string, content: string): Promise<void> {
  if (!db) return
  try {
    await addDoc(collection(db, 'messages'), {
      chatId,
      role,
      content,
      createdAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error saving message:', error)
  }
}

export async function getChatHistory(userId: string): Promise<Chat[]> {
  if (!db) return []

  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const snapshot = await getDocs(chatsQuery)
    const chats: Chat[] = []
    const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000)

    for (const docSnap of snapshot.docs) {
      const chatData = docSnap.data()
      const chatTimestamp = chatData.updatedAt?.toMillis?.() || 0

      if (chatTimestamp < fiveDaysAgo) {
        await deleteDoc(doc(db, 'chats', docSnap.id))
        await deleteChatMessages(docSnap.id)
      } else {
        chats.push({
          id: docSnap.id,
          title: chatData.title || 'Untitled',
          userId: chatData.userId,
          createdAt: chatData.createdAt,
          updatedAt: chatData.updatedAt,
        })
      }
    }
    return chats
  } catch (error) {
    console.error('Error loading chat history:', error)
    return []
  }
}

async function deleteChatMessages(chatId: string): Promise<void> {
  if (!db) return
  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    )
    const snapshot = await getDocs(messagesQuery)
    const deletePromises = snapshot.docs.map(msgDoc => deleteDoc(doc(db!, 'messages', msgDoc.id)))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error deleting messages:', error)
  }
}

export async function getMessages(chatId: string): Promise<any[]> {
  if (!db) return []

  try {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    )
    const snapshot = await getDocs(messagesQuery)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting messages:', error)
    return []
  }
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  if (!db) return
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      title,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating chat:', error)
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    await deleteChatMessages(chatId)
    if (!db) return
    await deleteDoc(doc(db, 'chats', chatId))
  } catch (error) {
    console.error('Error deleting chat:', error)
  }
}
