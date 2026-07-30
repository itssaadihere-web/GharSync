import 'package:flutter/foundation.dart';
import '../providers/providers.dart';

class AuthService {
  AuthUser? _currentUser;

  bool get isSignedIn => _currentUser != null;
  AuthUser? get currentUser => _currentUser;
  String? get currentUserId => _currentUser?.uid;
  String? get currentUserName => _currentUser?.displayName;

  Stream<AuthUser?> get authStateChanges async* {
    yield _currentUser;
  }

  Future<void> signInDemoUser({
    required String name,
    required String phone,
  }) async {
    _currentUser = AuthUser(
      uid: 'demo_${DateTime.now().millisecondsSinceEpoch}',
      displayName: name,
      phoneNumber: phone,
    );
    if (kDebugMode) print('Demo user signed in: $name');
  }

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(dynamic credential) verificationCompleted,
    required Function(dynamic ex) verificationFailed,
    required Function(String verificationId, int? resendToken) codeSent,
    required Function(String verificationId) codeAutoRetrievalTimeout,
  }) async {
    // Stub: skip real OTP in this build
    if (kDebugMode) print('Would send OTP to $phoneNumber');
    // Immediately simulate codeSent for demo
    codeSent('stub_verification_id', null);
  }

  Future<void> signInWithCredential(dynamic credential) async {
    _currentUser = AuthUser(uid: 'u1', displayName: 'Family Member');
    if (kDebugMode) print('Signed in with credential.');
  }

  Future<void> signInWithOTP({
    required String verificationId,
    required String smsCode,
  }) async {
    _currentUser = AuthUser(uid: 'u1', displayName: 'Family Member');
    if (kDebugMode) print('Signed in with OTP code: $smsCode');
  }

  Future<void> signOut() async {
    _currentUser = null;
    if (kDebugMode) print('User signed out.');
  }
}
