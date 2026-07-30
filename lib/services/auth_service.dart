import 'package:flutter/foundation.dart';

class AuthService {
  bool get isSignedIn => true;
  String? get currentUserId => 'u1';
  String? get currentUserName => 'Sadi';

  Future<bool> verifyPhoneAndSignIn(String phoneNumber, String smsCode) async {
    if (kDebugMode) {
      print('Authenticating user $phoneNumber with OTP code $smsCode');
    }
    return true;
  }

  Future<void> signOut() async {
    if (kDebugMode) {
      print('User signed out.');
    }
  }
}
