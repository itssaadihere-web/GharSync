import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/household.dart';
import '../models/member.dart';
import '../models/list_item.dart';
import '../models/task_item.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // --- Task Claiming & Permissions ---

  Future<void> claimGeneralTask({
    required String householdId,
    required String taskId,
    required String currentUserId,
    required String currentUserName,
  }) async {
    await _db
        .collection('households')
        .doc(householdId)
        .collection('tasks')
        .doc(taskId)
        .update({
      'assigneeName': currentUserName,
      'assigneeId': currentUserId,
      'isSyncedToGoogleTasks': true,
    });
  }

  Future<void> completeTask({
    required String householdId,
    required String taskId,
  }) async {
    await _db
        .collection('households')
        .doc(householdId)
        .collection('tasks')
        .doc(taskId)
        .update({
      'status': 'completed',
      'completedAt': Timestamp.fromDate(DateTime.now()),
    });
  }

  Future<bool> deleteTaskWithPermission({
    required String householdId,
    required String taskId,
    required String creatorUserId,
    required String currentUserId,
  }) async {
    if (creatorUserId != currentUserId) {
      return false; // Permission denied: Only creator can delete
    }

    await _db
        .collection('households')
        .doc(householdId)
        .collection('tasks')
        .doc(taskId)
        .delete();

    return true;
  }

  Future<bool> deletePurchaseItemWithPermission({
    required String householdId,
    required String itemId,
    required String creatorUserId,
    required String currentUserId,
  }) async {
    if (creatorUserId != currentUserId) {
      return false; // Permission denied: Only creator can delete
    }

    await _db
        .collection('households')
        .doc(householdId)
        .collection('listItems')
        .doc(itemId)
        .delete();

    return true;
  }

  // --- Streams for Tasks & Groups ---

  Stream<List<TaskItem>> streamPendingTasks(String householdId) {
    return _db
        .collection('households')
        .doc(householdId)
        .collection('tasks')
        .where('status', isEqualTo: 'pending')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => TaskItem.fromFirestore(doc)).toList());
  }

  Stream<List<TaskItem>> streamCompletedTasks(String householdId) {
    return _db
        .collection('households')
        .doc(householdId)
        .collection('tasks')
        .where('status', isEqualTo: 'completed')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => TaskItem.fromFirestore(doc)).toList());
  }

  // --- Household & Member Stream Operations ---

  Stream<Household?> streamHousehold(String householdId) {
    return _db
        .collection('households')
        .doc(householdId)
        .snapshots()
        .map((snap) => snap.exists ? Household.fromFirestore(snap) : null);
  }

  Stream<List<Member>> streamMembers(String householdId) {
    return _db
        .collection('households')
        .doc(householdId)
        .collection('members')
        .snapshots()
        .map((snap) => snap.docs.map((doc) => Member.fromFirestore(doc)).toList());
  }

  Stream<List<ListItem>> streamActiveItems(String householdId) {
    return _db
        .collection('households')
        .doc(householdId)
        .collection('listItems')
        .where('status', isEqualTo: 'pending')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((doc) => ListItem.fromFirestore(doc)).toList());
  }

  Future<void> updateHouseholdDetails({
    required String householdId,
    required String newName,
  }) async {
    await _db.collection('households').doc(householdId).update({
      'familyName': newName,
    });
  }
}
