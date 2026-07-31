import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  ListItem,
  Member,
  Household,
  ChatMessage,
  Group,
  ItemCategory,
  ParsedResult,
} from '../models/types';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_ITEMS: ListItem[] = [
  {
    itemId: uuidv4(),
    itemName: 'Aloo',
    quantity: 2,
    unit: 'kg',
    category: 'vegetables',
    status: 'pending',
    addedBy: { userId: 'u1', name: 'Ammi' },
    createdAt: Date.now() - 60000,
  },
  {
    itemId: uuidv4(),
    itemName: 'Doodh',
    quantity: 1,
    unit: 'liter',
    category: 'dairy',
    status: 'pending',
    addedBy: { userId: 'u2', name: 'Abbu' },
    createdAt: Date.now() - 30000,
  },
  {
    itemId: uuidv4(),
    itemName: 'Surf Excel',
    quantity: 1,
    unit: 'packet',
    category: 'toiletries',
    status: 'bought',
    addedBy: { userId: 'u1', name: 'Ammi' },
    boughtBy: { userId: 'u3', name: 'Sara' },
    createdAt: Date.now() - 120000,
    boughtAt: Date.now() - 20000,
  },
];

const SEED_MEMBERS: Member[] = [
  { userId: 'u1', name: 'Ammi', phoneNumber: '+92 300 1111111', role: 'admin', joinedAt: Date.now() - 86400000, isOnline: true },
  { userId: 'u2', name: 'Abbu', phoneNumber: '+92 300 2222222', role: 'member', joinedAt: Date.now() - 86400000, isOnline: false },
  { userId: 'u3', name: 'Sara', phoneNumber: '+92 300 3333333', role: 'runner', joinedAt: Date.now() - 43200000, isOnline: true },
];

const SEED_HOUSEHOLD: Household = {
  householdId: 'h1',
  familyName: 'Khan Family Household',
  subscriptionStatus: 'free',
  createdAt: Date.now() - 86400000,
  memberCount: 3,
};

const SEED_GROUPS: Group[] = [
  {
    groupId: 'g1',
    groupName: 'Khan Family Household',
    avatar: '🏡',
    lastMessage: 'Ammi: 2 kilo aloo le aao',
    lastTime: Date.now() - 300000,
    unreadCount: 2,
    memberCount: 3,
  },
  {
    groupId: 'g2',
    groupName: 'Office Project Team',
    avatar: '💼',
    lastMessage: 'Ali: Submit report by 5 PM',
    lastTime: Date.now() - 3600000,
    unreadCount: 1,
    memberCount: 4,
  },
  {
    groupId: 'g3',
    groupName: 'Cousins Group 🎉',
    avatar: '👨‍👩‍👧‍👦',
    lastMessage: 'Ahmed: Eid pe sab aana!',
    lastTime: Date.now() - 86400000,
    unreadCount: 0,
    memberCount: 8,
  },
];

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  g1: [
    {
      messageId: uuidv4(),
      senderId: 'u1',
      senderName: 'Ammi',
      text: '2 kilo aloo le aao',
      type: 'purchase',
      timestamp: Date.now() - 300000,
    },
    {
      messageId: uuidv4(),
      senderId: 'u2',
      senderName: 'Abbu',
      text: 'Theek hai, aa raha hoon bazaar',
      type: 'chat',
      timestamp: Date.now() - 240000,
    },
    {
      messageId: uuidv4(),
      senderId: 'u1',
      senderName: 'Ammi',
      text: 'Aur ek liter doodh bhi',
      type: 'purchase',
      timestamp: Date.now() - 180000,
    },
  ],
  g2: [
    {
      messageId: uuidv4(),
      senderId: 'u4',
      senderName: 'Ali',
      text: 'Submit project report by 5 PM',
      type: 'chat',
      timestamp: Date.now() - 3600000,
    },
  ],
};

// ─── Store Interface ───────────────────────────────────────────────────────────
interface HouseholdState {
  household: Household;
  items: ListItem[];
  members: Member[];
  groups: Group[];
  messages: Record<string, ChatMessage[]>;
  activeGroupId: string;

  // Item actions
  addItem: (item: ParsedResult, addedByName: string, addedByUserId: string) => void;
  markBought: (itemId: string, userId: string, userName: string) => void;
  markPending: (itemId: string) => void;
  deleteItem: (itemId: string) => void;

  // Chat actions
  sendMessage: (groupId: string, text: string, senderId: string, senderName: string) => void;
  setActiveGroup: (groupId: string) => void;
  clearUnread: (groupId: string) => void;
}

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  household: SEED_HOUSEHOLD,
  items: SEED_ITEMS,
  members: SEED_MEMBERS,
  groups: SEED_GROUPS,
  messages: SEED_MESSAGES,
  activeGroupId: 'g1',

  addItem: (parsed, addedByName, addedByUserId) => {
    const newItem: ListItem = {
      itemId: uuidv4(),
      itemName: parsed.itemName,
      quantity: parsed.quantity,
      unit: parsed.unit,
      category: parsed.category,
      status: 'pending',
      addedBy: { userId: addedByUserId, name: addedByName },
      createdAt: Date.now(),
    };
    set((state) => ({ items: [newItem, ...state.items] }));
  },

  markBought: (itemId, userId, userName) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.itemId === itemId
          ? { ...item, status: 'bought', boughtBy: { userId, name: userName }, boughtAt: Date.now() }
          : item
      ),
    }));
  },

  markPending: (itemId) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.itemId === itemId
          ? { ...item, status: 'pending', boughtBy: undefined, boughtAt: undefined }
          : item
      ),
    }));
  },

  deleteItem: (itemId) => {
    set((state) => ({ items: state.items.filter((i) => i.itemId !== itemId) }));
  },

  sendMessage: (groupId, text, senderId, senderName) => {
    const msg: ChatMessage = {
      messageId: uuidv4(),
      senderId,
      senderName,
      text,
      type: 'chat',
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: [...(state.messages[groupId] ?? []), msg],
      },
      groups: state.groups.map((g) =>
        g.groupId === groupId
          ? { ...g, lastMessage: `${senderName}: ${text}`, lastTime: Date.now() }
          : g
      ),
    }));
  },

  setActiveGroup: (groupId) => set({ activeGroupId: groupId }),

  clearUnread: (groupId) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.groupId === groupId ? { ...g, unreadCount: 0 } : g
      ),
    }));
  },
}));
