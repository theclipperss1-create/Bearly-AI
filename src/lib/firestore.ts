// Firestore functions - Firebase integration (optional)
// These functions use dynamic imports to avoid webpack errors

export interface Chat {
  id: string
  title: string
  userId: string
  createdAt: any
  updatedAt: any
}

export async function createChat(userId: string, title: string): Promise<string> {
  try {
    const { getFirestore } = await import('./firebase')
    const { collection, addDoc, Timestamp } = await import('firebase/firestore')
    const db = await getFirestore()
    if (!db) throw new Error('Firestore not initialized')

    const chatRef = await addDoc(collection(db, 'chats'), {
      userId,
      title,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return chatRef.id
  } catch (error) {
    console.log('Chat history disabled - Firebase not configured')
    return 'local-' + Date.now()
  }
}

export async function saveMessage(
  chatId: string,
  role: string,
  content: string
): Promise<void> {
  try {
    const { getFirestore } = await import('./firebase')
    const { collection, addDoc, Timestamp } = await import('firebase/firestore')
    const db = await getFirestore()
    if (!db) return

    await addDoc(collection(db, 'messages'), {
      chatId,
      role,
      content,
      createdAt: Timestamp.now(),
    })
  } catch (error) {
    // Silent fail - chat history disabled
  }
}

export async function getChatHistory(userId: string): Promise<any[]> {
  try {
    const { getFirestore } = await import('./firebase')
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
    const db = await getFirestore()
    if (!db) return []

    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const snapshot = await getDocs(chatsQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    return []
  }
}

export async function getMessages(chatId: string): Promise<any[]> {
  try {
    const { getFirestore } = await import('./firebase')
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
    const db = await getFirestore()
    if (!db) return []

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    )

    const snapshot = await getDocs(messagesQuery)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    return []
  }
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  try {
    const { getFirestore } = await import('./firebase')
    const { doc, updateDoc, Timestamp } = await import('firebase/firestore')
    const db = await getFirestore()
    if (!db) return

    const chatRef = doc(db, 'chats', chatId)
    await updateDoc(chatRef, {
      title,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    // Silent fail
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    const { getFirestore } = await import('./firebase')
    const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore')
    const db = await getFirestore()
    if (!db) return

    const messagesQuery = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    )

    const snapshot = await getDocs(messagesQuery)
    const deletePromises = snapshot.docs.map(docRef => deleteDoc(docRef.ref))
    await Promise.all(deletePromises)

    await deleteDoc(doc(db, 'chats', chatId))
  } catch (error) {
    // Silent fail
  }
}
