// ─── GharSync TypeScript Models ───────────────────────────────────────

export type ItemStatus = 'pending' | 'bought';

export type ItemCategory =
  | 'vegetables'
  | 'dairy'
  | 'toiletries'
  | 'medical'
  | 'grocery'
  | 'other';

export const CATEGORY_META: Record<
  ItemCategory,
  { label: string; emoji: string; color: string }
> = {
  vegetables: { label: 'Vegetables', emoji: '🥦', color: '#16A34A' },
  dairy:      { label: 'Dairy',      emoji: '🥛', color: '#2563EB' },
  toiletries: { label: 'Toiletries', emoji: '🧼', color: '#7C3AED' },
  medical:    { label: 'Medical',    emoji: '💊', color: '#DC2626' },
  grocery:    { label: 'Grocery',    emoji: '🌾', color: '#D97706' },
  other:      { label: 'Other',      emoji: '📦', color: '#64748B' },
};

export interface UserRef {
  userId: string;
  name: string;
}

export interface ListItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: ItemCategory;
  status: ItemStatus;
  addedBy: UserRef;
  boughtBy?: UserRef;
  createdAt: number; // epoch ms
  boughtAt?: number;
}

export interface Member {
  userId: string;
  name: string;
  phoneNumber: string;
  role: 'admin' | 'member' | 'runner';
  joinedAt: number;
  isOnline?: boolean;
}

export interface Household {
  householdId: string;
  familyName: string;
  subscriptionStatus: 'free' | 'premium';
  createdAt: number;
  memberCount: number;
}

export type MessageType = 'chat' | 'purchase' | 'task';

export interface ChatMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: MessageType;
  extractedItems?: Partial<ListItem>[];
  timestamp: number;
}

export interface TaskItem {
  taskId: string;
  title: string;
  assigneeName: string;
  dueText: string;
  status: 'pending' | 'completed';
  createdAt: number;
}

export interface Group {
  groupId: string;
  groupName: string;
  avatar: string;
  lastMessage: string;
  lastTime: number;
  unreadCount: number;
  memberCount: number;
}

// Parser result
export interface ParsedResult {
  itemName: string;
  quantity: number;
  unit: string;
  category: ItemCategory;
}

// Auth user
export interface AuthUser {
  uid: string;
  displayName: string;
  phoneNumber: string;
}
