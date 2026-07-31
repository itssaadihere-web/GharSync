import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHouseholdStore } from '../../../src/store/householdStore';
import { useAuthStore } from '../../../src/store/authStore';
import { parse } from '../../../src/services/ruleBasedParser';
import { Colors, FontSize, Radius, Shadow } from '../../../src/theme/colors';
import { CATEGORY_META } from '../../../src/models/types';
import type { ChatMessage } from '../../../src/models/types';
import { formatDistanceToNow } from 'date-fns';

function ChatBubble({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  const isPurchase = msg.type === 'purchase';
  return (
    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
      {!isMe && <Text style={styles.bubbleSender}>{msg.senderName}</Text>}
      {isPurchase && (
        <View style={styles.purchaseTag}>
          <Ionicons name="basket-outline" size={12} color={Colors.primaryEmerald} />
          <Text style={styles.purchaseTagText}>Grocery Request</Text>
        </View>
      )}
      <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
        {msg.text}
      </Text>
      <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
        {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
      </Text>
    </View>
  );
}

export default function GroupWorkspaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parse> | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const groups = useHouseholdStore((s) => s.groups);
  const messages = useHouseholdStore((s) => s.messages);
  const addItem = useHouseholdStore((s) => s.addItem);
  const sendMessage = useHouseholdStore((s) => s.sendMessage);
  const clearUnread = useHouseholdStore((s) => s.clearUnread);
  const user = useAuthStore((s) => s.user);

  const group = groups.find((g) => g.groupId === id);
  const groupMessages = messages[id ?? ''] ?? [];

  useEffect(() => {
    if (id) clearUnread(id);
  }, [id]);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [groupMessages.length]);

  const handleSend = () => {
    if (!inputText.trim() || !id) return;

    const text = inputText.trim();
    const parsed = parse(text);

    // Auto-add grocery items to list
    if (parsed.itemName && parsed.category !== 'other') {
      addItem(parsed, user?.displayName ?? 'You', user?.uid ?? 'u1');
      sendMessage(
        id,
        `🛒 ${text} — Added to grocery list!`,
        user?.uid ?? 'u1',
        user?.displayName ?? 'You'
      );
    } else {
      sendMessage(id, text, user?.uid ?? 'u1', user?.displayName ?? 'You');
    }

    setInputText('');
    setParsedPreview(null);
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.trim().length > 2) {
      setParsedPreview(parse(val));
    } else {
      setParsedPreview(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={{ fontSize: 22 }}>{group?.avatar ?? '🏡'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{group?.groupName ?? 'Group'}</Text>
          <Text style={styles.headerSub}>{group?.memberCount} members</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="call-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={groupMessages}
        keyExtractor={(m) => m.messageId}
        renderItem={({ item }) => (
          <ChatBubble msg={item} isMe={item.senderId === user?.uid} />
        )}
        contentContainerStyle={styles.chatList}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>💬</Text>
            <Text style={styles.emptyText}>No messages yet.</Text>
            <Text style={styles.emptySubText}>
              Type a grocery item like "2 kg aloo" to add it to the list!
            </Text>
          </View>
        }
      />

      {/* AI Parser Preview */}
      {parsedPreview && parsedPreview.itemName && (
        <View style={styles.preview}>
          <Text style={{ fontSize: 18 }}>{CATEGORY_META[parsedPreview.category].emoji}</Text>
          <Text style={styles.previewText}>
            Add to list: <Text style={{ fontFamily: 'Inter_700Bold', color: Colors.primaryEmerald }}>{parsedPreview.itemName}</Text>
            {' '}({parsedPreview.quantity} {parsedPreview.unit})
          </Text>
        </View>
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder='Type a message or "2 kg aloo"...'
            placeholderTextColor={Colors.grey400}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE5DD' },
  header: {
    backgroundColor: Colors.whatsappGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: { padding: 6 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.base, fontFamily: 'Inter_700Bold', color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular' },
  headerBtn: { padding: 6 },
  chatList: { padding: 12, paddingBottom: 16, gap: 4 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 12,
    padding: 10,
    marginVertical: 3,
    ...Shadow.sm,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.chatBubbleSent,
    borderTopRightRadius: 2,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.chatBubbleReceived,
    borderTopLeftRadius: 2,
  },
  bubbleSender: { fontSize: FontSize.xs, fontFamily: 'Inter_700Bold', color: Colors.primaryEmerald, marginBottom: 3 },
  purchaseTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  purchaseTagText: { fontSize: FontSize.xs, color: Colors.primaryEmerald, fontFamily: 'Inter_600SemiBold' },
  bubbleText: { fontSize: FontSize.sm, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  bubbleTextMe: { color: Colors.textDark },
  bubbleTextThem: { color: Colors.textDark },
  bubbleTime: { fontSize: 10, marginTop: 4, fontFamily: 'Inter_400Regular' },
  bubbleTimeMe: { textAlign: 'right', color: Colors.grey500 },
  bubbleTimeThem: { color: Colors.grey400 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  previewText: { fontSize: FontSize.xs, color: Colors.primaryDark, fontFamily: 'Inter_400Regular', flex: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: Colors.surface,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.grey50,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: FontSize.base,
    color: Colors.textDark,
    maxHeight: 100,
    fontFamily: 'Inter_400Regular',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryEmerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.grey300 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32, gap: 8 },
  emptyText: { fontSize: FontSize.lg, fontFamily: 'Inter_700Bold', color: Colors.grey700 },
  emptySubText: { fontSize: FontSize.sm, color: Colors.grey500, textAlign: 'center', fontFamily: 'Inter_400Regular', lineHeight: 20 },
});
