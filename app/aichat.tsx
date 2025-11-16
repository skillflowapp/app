import { AdminColors } from '@/components/admin/AdminLayout';
import { ThemedText } from '@/components/themed-text';
import { db } from '@/constants/firebase';
import { useSession } from '@/context/AuthContext';
import geminiService from '@/services/geminiService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messageCount: number;
}

// Typing Indicator Component
const TypingIndicator: React.FC = () => {
  const dotOpacities = [
    useRef(new Animated.Value(0.5)).current,
    useRef(new Animated.Value(0.5)).current,
    useRef(new Animated.Value(0.5)).current,
  ];

  useEffect(() => {
    const animateTyping = () => {
      dotOpacities.forEach((opacity) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(opacity, {
              toValue: 0.5,
              duration: 300,
              useNativeDriver: false,
            }),
          ]),
          { iterations: -1 }
        ).start();
      });
    };

    animateTyping();
  }, [dotOpacities]);

  return (
    <View style={styles.typingContainer}>
      {dotOpacities.map((opacity, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              opacity: opacity,
              marginLeft: index > 0 ? 4 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

const SAMPLE_PROMPTS = [
  'How can I improve my study skills?',
  'Explain quantum physics simply',
  'What are effective learning techniques?',
  'How do I manage my time better?',
];

export default function AiChat() {
  const { session } = useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(Date.now().toString());
  const [loadingChats, setLoadingChats] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Initialize Gemini service with user data
  useEffect(() => {
    if (session?.displayName && session?.role) {
      geminiService.initializeUserContext(session.displayName, session.role);
    }
  }, [session]);

  // Load chat history from Firestore on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!session?.uid) return;
      
      try {
        const chatsRef = collection(db, 'users', session.uid, 'chats');
        const q = query(chatsRef, where('archived', '==', false));
        const querySnapshot = await getDocs(q);
        
        const chats: ChatHistory[] = [];
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          chats.push({
            id: docSnapshot.id,
            title: data.title || 'Untitled Chat',
            timestamp: data.timestamp?.toDate?.() || new Date(),
            messageCount: data.messageCount || 0,
          });
        });
        
        // Sort by timestamp descending (most recent first)
        chats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setChatHistory(chats);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setLoadingChats(false);
      }
    };

    loadChatHistory();
  }, [session?.uid]);

  // Save current chat to Firestore
  const saveCurrentChat = async () => {
    if (!session?.uid || messages.length === 0) return;

    try {
      const chatTitle = messages[0]?.content?.substring(0, 40) || 'Untitled Chat';
      const chatRef = doc(db, 'users', session.uid, 'chats', currentChatId);
      
      await setDoc(chatRef, {
        title: chatTitle,
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })),
        messageCount: messages.length,
        timestamp: serverTimestamp(),
        archived: false,
      }, { merge: true });
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  // Load a specific chat from Firestore
  const loadChatFromFirestore = async (chatId: string) => {
    if (!session?.uid) return;

    try {
      const chatRef = doc(db, 'users', session.uid, 'chats', chatId);
      const docSnapshot = await getDoc(chatRef);
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const loadedMessages: ChatMessage[] = data.messages?.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })) || [];
        
        setMessages(loadedMessages);
        setCurrentChatId(chatId);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading chat from Firestore:', error);
    }
  };

  // Save chat to history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const chatTitle = messages[0]?.content?.substring(0, 40) || 'New Chat';
      setChatHistory((prev) => {
        const existingIndex = prev.findIndex((chat) => chat.id === currentChatId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            messageCount: messages.length,
            timestamp: new Date(),
          };
          return updated;
        } else {
          return [
            {
              id: currentChatId,
              title: chatTitle,
              timestamp: new Date(),
              messageCount: messages.length,
            },
            ...prev,
          ];
        }
      });
      
      // Save to Firestore
      saveCurrentChat();
    }
  }, [messages, currentChatId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Get response from Gemini API
      const aiResponse = await geminiService.sendMessage(text);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response. Please try again.';
      
      // Show error message to user
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);

      // Also log for debugging
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          onPress: () => setShowOptionsMenu(false),
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: () => {
            setMessages([]);
            geminiService.clearHistory(); // Clear Gemini conversation history
            setShowOptionsMenu(false);
            setCurrentChatId(Date.now().toString());
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleNewChat = () => {
    setMessages([]);
    geminiService.clearHistory();
    setCurrentChatId(Date.now().toString());
    setSidebarOpen(false);
  };

  const handleSelectChat = (chat: ChatHistory) => {
    loadChatFromFirestore(chat.id);
  };

  const handleDeleteChat = (chatId: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (chatId === currentChatId) {
      handleNewChat();
    }
  };

  const handleGoBack = () => {
    if (inputText.trim()) {
      Alert.alert(
        'Unsent Message',
        'You have an unsent message. Are you sure you want to go back?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            onPress: () => router.replace('/(app)/student-dashboard'),
            style: 'default',
          },
        ]
      );
    } else {
      router.replace('/(app)/student-dashboard');
    }
  };

  const renderChatHistoryItem = ({ item }: { item: ChatHistory }) => (
    <TouchableOpacity
      style={[
        styles.historyItem,
        currentChatId === item.id && styles.historyItemActive,
      ]}
      onPress={() => handleSelectChat(item)}
    >
      <View style={styles.historyItemContent}>
        <Ionicons
          name="chatbubble"
          size={16}
          color={currentChatId === item.id ? AdminColors.accent : AdminColors.textLight}
        />
        <View style={styles.historyItemText}>
          <ThemedText
            style={[
              styles.historyItemTitle,
              currentChatId === item.id && styles.historyItemTitleActive,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>
          <ThemedText style={styles.historyItemSubtitle}>
            {item.messageCount} messages
          </ThemedText>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteChat(item.id)}
        style={styles.historyDeleteBtn}
      >
        <Ionicons name="close" size={16} color={AdminColors.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageBubble, item.type === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.type === 'user' ? (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessageBox}>
            <ThemedText style={styles.userMessageText}>
              {item.content}
            </ThemedText>
            <ThemedText style={styles.messageTime}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </View>
          <View style={styles.userIcon}>
            <Ionicons name="person-circle" size={32} color={AdminColors.accent} />
          </View>
        </View>
      ) : (
        <View style={styles.aiMessageContainer}>
          <View style={styles.aiIcon}>
            <MaterialCommunityIcons name="robot" size={32} color={AdminColors.accent} />
          </View>
          <View style={styles.aiMessageBox}>
            <ThemedText style={styles.aiMessageText}>
              {item.content}
            </ThemedText>
            <ThemedText style={[styles.messageTime, styles.aiMessageTime]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <ScrollView contentContainerStyle={styles.emptyContainer}>
      <View style={styles.welcomeSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubble-ellipses" size={64} color={AdminColors.accent} />
        </View>
        <ThemedText style={styles.welcomeTitle}>
          Welcome, {session?.displayName || 'Student'}!
        </ThemedText>
        <ThemedText style={styles.welcomeSubtitle}>
          I'm SkillFlow AI, your personal learning assistant. I'm here to help you learn, understand complex topics, and achieve your educational goals.
        </ThemedText>

        <View style={styles.purposeSection}>
          <ThemedText style={styles.purposeTitle}>What I can help you with:</ThemedText>
          <View style={styles.purposeList}>
            <View style={styles.purposeItem}>
              <Ionicons name="checkmark-circle" size={20} color={AdminColors.success} />
              <ThemedText style={styles.purposeText}>Answer questions on any topic</ThemedText>
            </View>
            <View style={styles.purposeItem}>
              <Ionicons name="checkmark-circle" size={20} color={AdminColors.success} />
              <ThemedText style={styles.purposeText}>Explain complex concepts simply</ThemedText>
            </View>
            <View style={styles.purposeItem}>
              <Ionicons name="checkmark-circle" size={20} color={AdminColors.success} />
              <ThemedText style={styles.purposeText}>Help with study strategies</ThemedText>
            </View>
            <View style={styles.purposeItem}>
              <Ionicons name="checkmark-circle" size={20} color={AdminColors.success} />
              <ThemedText style={styles.purposeText}>Provide learning resources</ThemedText>
            </View>
          </View>
        </View>

        <ThemedText style={styles.promptTitle}>Try asking me something:</ThemedText>
        <View style={styles.promptsContainer}>
          {SAMPLE_PROMPTS.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.promptButton}
              onPress={() => handleSendMessage(prompt)}
            >
              <Ionicons name="sparkles" size={16} color={AdminColors.accent} />
              <ThemedText style={styles.promptText}>{prompt}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <TouchableOpacity
          style={styles.sidebarOverlay}
          onPress={() => setSidebarOpen(false)}
          activeOpacity={1}
        />
      )}

      {/* Sidebar */}
      <View style={[styles.sidebar, sidebarOpen && styles.sidebarOpen]}>
        <View style={styles.sidebarHeader}>
          <ThemedText style={styles.sidebarTitle}>Chat History</ThemedText>
          <TouchableOpacity onPress={() => setSidebarOpen(false)}>
            <Ionicons name="close" size={24} color={AdminColors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <ThemedText style={styles.newChatButtonText}>New Chat</ThemedText>
        </TouchableOpacity>

        <FlatList
          data={chatHistory}
          renderItem={renderChatHistoryItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          style={styles.historyList}
        />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color={AdminColors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuButton}
            >
              <Ionicons name="menu" size={24} color={AdminColors.primary} />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Ionicons name="chatbubble" size={24} color={AdminColors.accent} />
              <ThemedText style={styles.headerText}>SkillFlow AI</ThemedText>
            </View>
            <TouchableOpacity
              onPress={() => setShowOptionsMenu(!showOptionsMenu)}
              style={styles.optionsButton}
            >
              <Ionicons name="ellipsis-vertical" size={24} color={AdminColors.primary} />
            </TouchableOpacity>
          </View>

          {/* Options Menu */}
          {showOptionsMenu && (
            <View style={styles.optionsMenu}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleClearChat}
              >
                <Ionicons name="trash" size={20} color={AdminColors.danger} />
                <ThemedText style={[styles.optionText, { color: AdminColors.danger }]}>Clear Chat</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.onlineBadge}>
            <View style={styles.onlineIndicator} />
            <ThemedText style={styles.onlineText}>Online</ThemedText>
          </View>
        </View>

        {/* Chat Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.contentContainer}
        >
          {messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              scrollEnabled={true}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <TypingIndicator />
              <ThemedText style={styles.loadingText}>SkillFlow AI is thinking...</ThemedText>
            </View>
          )}

          {/* Input Area */}
          <View style={styles.inputArea}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
              >
                <MaterialCommunityIcons name="paperclip" size={20} color={AdminColors.accent} />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor={AdminColors.textLight}
                value={inputText}
                onChangeText={setInputText}
                multiline
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim() || loading}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Attachment Menu */}
            {showAttachmentMenu && (
              <View style={styles.attachmentMenu}>
                <TouchableOpacity style={styles.attachmentOption}>
                  <MaterialCommunityIcons name="file-document" size={24} color={AdminColors.accent} />
                  <ThemedText style={styles.attachmentOptionText}>Document</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentOption}>
                  <MaterialCommunityIcons name="image" size={24} color={AdminColors.accent} />
                  <ThemedText style={styles.attachmentOptionText}>Image</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachmentOption}>
                  <MaterialCommunityIcons name="link" size={24} color={AdminColors.accent} />
                  <ThemedText style={styles.attachmentOptionText}>Link</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminColors.background,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  optionsButton: {
    padding: 4,
  },
  optionsMenu: {
    backgroundColor: AdminColors.card,
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AdminColors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AdminColors.success,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: AdminColors.success,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: AdminColors.card,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    transform: [{ translateX: -280 }],
    zIndex: 100,
  },
  sidebarOpen: {
    transform: [{ translateX: 0 }],
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AdminColors.primary,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AdminColors.accent,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newChatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  historyItemActive: {
    backgroundColor: AdminColors.background,
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyItemText: {
    flex: 1,
    gap: 2,
  },
  historyItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: AdminColors.text,
  },
  historyItemTitleActive: {
    color: AdminColors.accent,
    fontWeight: '700',
  },
  historyItemSubtitle: {
    fontSize: 11,
    color: AdminColors.textLight,
  },
  historyDeleteBtn: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  messageBubble: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    marginLeft: '5%',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    marginRight: '5%',
  },
  userMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userMessageBox: {
    backgroundColor: AdminColors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  userMessageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  userIcon: {
    marginBottom: 4,
  },
  aiMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  aiIcon: {
    marginBottom: 4,
  },
  aiMessageBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  aiMessageText: {
    color: AdminColors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  aiMessageTime: {
    color: AdminColors.textLight,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AdminColors.accent,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: AdminColors.textLight,
    fontWeight: '500',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: AdminColors.card,
    borderRadius: 64,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: AdminColors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: AdminColors.textLight,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 21,
  },
  purposeSection: {
    width: '100%',
    backgroundColor: AdminColors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
  },
  purposeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.primary,
    marginBottom: 12,
  },
  purposeList: {
    gap: 10,
  },
  purposeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  purposeText: {
    fontSize: 13,
    color: AdminColors.text,
    fontWeight: '500',
    flex: 1,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AdminColors.primary,
    marginBottom: 12,
  },
  promptsContainer: {
    width: '100%',
    gap: 10,
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AdminColors.card,
    borderWidth: 1,
    borderColor: AdminColors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  promptText: {
    fontSize: 13,
    color: AdminColors.text,
    fontWeight: '500',
    flex: 1,
  },
  inputArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: AdminColors.background,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AdminColors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: AdminColors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: AdminColors.textLight,
    opacity: 0.5,
  },
  attachmentMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: AdminColors.card,
    borderRadius: 12,
    marginTop: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentOption: {
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  attachmentOptionText: {
    fontSize: 12,
    color: AdminColors.text,
    fontWeight: '500',
  },
});
