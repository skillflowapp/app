import { AdminColors } from '@/components/admin/AdminLayout';
import { ThemedText } from '@/components/themed-text';
import { useSession } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

const SAMPLE_PROMPTS = [
  'How can I improve my study skills?',
  'Explain quantum physics simply',
  'What are effective learning techniques?',
  'How do I manage my time better?',
];

export default function AiChat() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Mock AI response function
  const generateAIResponse = (userMessage: string): string => {
    const responses: { [key: string]: string } = {
      'study': 'Great question! Effective study techniques include: 1) Active recall - test yourself regularly, 2) Spaced repetition - review material at increasing intervals, 3) Pomodoro technique - 25-minute focused sessions with breaks, 4) Creating mind maps - visualize connections between concepts.',
      'learn': 'Learning is more effective when you: 1) Engage with the material actively, 2) Connect new information to what you already know, 3) Teach others what you have learned, 4) Use multiple learning modalities (reading, writing, speaking), 5) Stay consistent with your learning schedule.',
      'time': 'Time management tips: 1) Prioritize tasks using the Eisenhower Matrix (urgent vs important), 2) Break large tasks into smaller, manageable steps, 3) Use time-blocking to allocate specific times for different activities, 4) Track how you spend your time, 5) Learn to say no to non-essential tasks.',
      'quantum': 'Quantum physics is the science of the very small - atoms and particles. Key concepts: 1) Superposition - particles exist in multiple states until observed, 2) Entanglement - particles are mysteriously connected, 3) Wave-particle duality - particles behave as both waves and particles. It is counterintuitive but explains much about our universe!',
    };

    // Find relevant response based on keywords
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Default response
    return 'That\'s an interesting question! I\'d be happy to help you explore this topic further. Could you provide more details about what specific aspect you\'d like to understand?';
  };

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

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
            setShowOptionsMenu(false);
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleGoBack = () => {
    if (messages.length > 0) {
      Alert.alert(
        'Leave Chat?',
        'You have messages in this chat. Are you sure you want to leave?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            onPress: () => router.back(),
            style: 'default',
          },
        ]
      );
    } else {
      router.back();
    }
  };

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
          I'm your AI learning assistant. I'm here to help you learn, understand complex topics, and achieve your educational goals.
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
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={AdminColors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Ionicons name="chatbubble" size={24} color={AdminColors.accent} />
            <ThemedText style={styles.headerText}>AI Learning Assistant</ThemedText>
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
            <ActivityIndicator size="small" color={AdminColors.accent} />
            <ThemedText style={styles.loadingText}>AI is thinking...</ThemedText>
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
              maxHeight={100}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AdminColors.background,
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
    gap: 12,
  },
  backButton: {
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
