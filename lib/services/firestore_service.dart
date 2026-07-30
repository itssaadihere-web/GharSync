import '../models/household.dart';
import '../models/member.dart';
import '../models/list_item.dart';
import '../models/task_item.dart';

class FirestoreService {
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

  Future<void> updateHouseholdDetails({
    required String householdId,
    required String newName,
  }) async {}
}
