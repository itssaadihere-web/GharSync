import 'package:flutter/foundation.dart';

class FcmService {
  Future<void> initializeFCM() async {
    if (kDebugMode) {
      print('FCM Service initialized.');
    }
  }

  Future<void> subscribeToHouseholdTopic(String householdId) async {
    if (kDebugMode) {
      print('Subscribed to FCM topic: $householdId');
    }
  }
}
