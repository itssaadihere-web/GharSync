import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

class FcmService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> initialize() async {
    try {
      NotificationSettings settings = await _fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        if (kDebugMode) {
          print('User granted FCM notification permission');
        }
      }

      // Foreground message listener
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (kDebugMode) {
          print('Foreground FCM message: ${message.notification?.title} - ${message.notification?.body}');
        }
      });
    } catch (e) {
      if (kDebugMode) {
        print('FCM Init Error: $e');
      }
    }
  }

  Future<void> subscribeToHouseholdTopic(String householdId) async {
    try {
      await _fcm.subscribeToTopic('household_$householdId');
      if (kDebugMode) {
        print('Subscribed to FCM topic household_$householdId');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error subscribing to FCM topic: $e');
      }
    }
  }

  Future<void> unsubscribeFromHouseholdTopic(String householdId) async {
    try {
      await _fcm.unsubscribeFromTopic('household_$householdId');
    } catch (e) {
      if (kDebugMode) {
        print('Error unsubscribing FCM topic: $e');
      }
    }
  }
}
