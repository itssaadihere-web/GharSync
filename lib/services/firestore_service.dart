import '../models/household.dart';
import '../models/member.dart';
import '../models/list_item.dart';
import '../models/task_item.dart';

class FirestoreService {
  // --- Purchase Item Methods ---
  Future<void> markItemBought({
    required String householdId,
    required String itemId,
    required String currentUserId,
    required String currentUserName,
  }) async {}

  Future<void> markItemPending({
    required String householdId,
    required String itemId,
  }) async {}

  Future<void> deleteItem({
    required String householdId,
    required String itemId,
  }) async {}

  Future<Household> createHousehold({
    required String familyName,
    required String creatorUserId,
    required String creatorName,
    required String creatorPhone,
  }) async {
    return Household(
      householdId: 'household_${DateTime.now().millisecondsSinceEpoch}',
      familyName: familyName,
      createdAt: DateTime.now(),
    );
  }

  Future<void> addMemberToHousehold({
    required String householdId,
    required String userId,
    required String name,
    required String phoneNumber,
  }) async {}


  Future<void> addItem({
    required String householdId,
    required ListItem item,
  }) async {}

  // --- Task Methods ---
  Future<void> claimGeneralTask({
    required String householdId,
    required String taskId,
    required String currentUserId,
    required String currentUserName,
  }) async {}

  Future<void> completeTask({
    required String householdId,
    required String taskId,
  }) async {}

  Future<bool> deleteTaskWithPermission({
    required String householdId,
    required String taskId,
    required String creatorUserId,
    required String currentUserId,
  }) async {
    return creatorUserId == currentUserId;
  }

  Future<bool> deletePurchaseItemWithPermission({
    required String householdId,
    required String itemId,
    required String creatorUserId,
    required String currentUserId,
  }) async {
    return creatorUserId == currentUserId;
  }

  // --- Household Methods ---
  Future<void> updateHouseholdDetails({
    required String householdId,
    required String newName,
  }) async {}

  // --- Streams ---
  Stream<List<TaskItem>> streamPendingTasks(String householdId) async* {
    yield [];
  }

  Stream<List<TaskItem>> streamCompletedTasks(String householdId) async* {
    yield [];
  }

  Stream<Household?> streamHousehold(String householdId) async* {
    yield null;
  }

  Stream<List<Member>> streamMembers(String householdId) async* {
    yield [];
  }

  Stream<List<ListItem>> streamActiveItems(String householdId) async* {
    yield [];
  }

  Stream<List<ListItem>> streamAllItems(String householdId) async* {
    yield [];
  }

  Stream<List<ListItem>> streamHistoryItems(String householdId) async* {
    yield [];
  }
}
