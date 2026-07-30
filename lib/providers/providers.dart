import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/household.dart';
import '../models/member.dart';
import '../models/list_item.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../services/ai_parser_service.dart';
import '../services/fcm_service.dart';

// Services
final authServiceProvider = Provider<AuthService>((ref) => AuthService());
final firestoreServiceProvider = Provider<FirestoreService>((ref) => FirestoreService());
final aiParserServiceProvider = Provider<AiParserService>((ref) => AiParserService());
final fcmServiceProvider = Provider<FcmService>((ref) => FcmService());

// Auth State — pure Dart, no firebase_auth dependency
final authStateProvider = StateProvider<AuthUser?>((ref) {
  return AuthUser(uid: 'u1', displayName: 'Sadi', phoneNumber: '+92 300 1234567');
});

// Currently Selected Household ID State
final activeHouseholdIdProvider = StateProvider<String?>((ref) => 'g1');

// Current User Profile State (Name, Phone)
final currentUserNameProvider = StateProvider<String>((ref) {
  final user = ref.watch(authStateProvider);
  return user?.displayName ?? 'Family Member';
});

final currentUserPhoneProvider = StateProvider<String>((ref) {
  final user = ref.watch(authStateProvider);
  return user?.phoneNumber ?? '+92 300 1234567';
});

// Household Stream Provider
final activeHouseholdStreamProvider = StreamProvider<Household?>((ref) {
  final householdId = ref.watch(activeHouseholdIdProvider);
  if (householdId == null) return Stream.value(null);
  return ref.watch(firestoreServiceProvider).streamHousehold(householdId);
});

// Members Stream Provider
final householdMembersStreamProvider = StreamProvider<List<Member>>((ref) {
  final householdId = ref.watch(activeHouseholdIdProvider);
  if (householdId == null) return Stream.value([]);
  return ref.watch(firestoreServiceProvider).streamMembers(householdId);
});

// Active Pending List Items Stream Provider
final activeItemsStreamProvider = StreamProvider<List<ListItem>>((ref) {
  final householdId = ref.watch(activeHouseholdIdProvider);
  if (householdId == null) return Stream.value([]);
  return ref.watch(firestoreServiceProvider).streamActiveItems(householdId);
});

// All Household List Items Stream Provider
final allItemsStreamProvider = StreamProvider<List<ListItem>>((ref) {
  final householdId = ref.watch(activeHouseholdIdProvider);
  if (householdId == null) return Stream.value([]);
  return ref.watch(firestoreServiceProvider).streamAllItems(householdId);
});

// Past 30 Days History Stream Provider
final historyItemsStreamProvider = StreamProvider<List<ListItem>>((ref) {
  final householdId = ref.watch(activeHouseholdIdProvider);
  if (householdId == null) return Stream.value([]);
  return ref.watch(firestoreServiceProvider).streamHistoryItems(householdId);
});

// Shopping Mode Category Filter Provider
final shoppingCategoryFilterProvider = StateProvider<ItemCategory?>((ref) => null);

// Grouped Items by Category Map
final groupedActiveItemsProvider = Provider<Map<ItemCategory, List<ListItem>>>((ref) {
  final itemsAsync = ref.watch(activeItemsStreamProvider);
  final items = itemsAsync.value ?? [];

  final Map<ItemCategory, List<ListItem>> grouped = {};
  for (var cat in ItemCategory.values) {
    grouped[cat] = [];
  }

  for (var item in items) {
    grouped[item.category]?.add(item);
  }

  grouped.removeWhere((key, value) => value.isEmpty);
  return grouped;
});

// Pure Dart Auth User model (replaces firebase_auth User)
class AuthUser {
  final String uid;
  final String? displayName;
  final String? phoneNumber;

  AuthUser({required this.uid, this.displayName, this.phoneNumber});
}
