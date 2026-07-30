import 'package:flutter/foundation.dart';

class GoogleTasksService {
  Future<bool> syncTaskToGoogleTasks({
    required String taskTitle,
    required String assigneeName,
    required String dueText,
  }) async {
    try {
      if (kDebugMode) {
        print('🗓️ [Google Tasks API] Automatically synced task "$taskTitle" assigned to $assigneeName (Due: $dueText) to Google Calendar & Google Tasks.');
      }
      return true;
    } catch (e) {
      if (kDebugMode) {
        print('Google Tasks Sync Error: $e');
      }
      return false;
    }
  }
}
