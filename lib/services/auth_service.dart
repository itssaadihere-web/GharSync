import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class AppUser {
  final String uid;
  final String? phoneNumber;
  final String displayName;

  AppUser({
    required this.uid,
    this.phoneNumber,
    required this.displayName,
  });
}

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required Function(PhoneAuthCredential) verificationCompleted,
    required Function(FirebaseAuthException) verificationFailed,
    required Function(String verificationId, int? resendToken) codeSent,
    required Function(String verificationId) codeAutoRetrievalTimeout,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: verificationCompleted,
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: codeAutoRetrievalTimeout,
      timeout: const Duration(seconds: 60),
    );
  }

  Future<UserCredential> signInWithCredential(AuthCredential credential) async {
    return await _auth.signInWithCredential(credential);
  }

  Future<UserCredential> signInWithOTP({
    required String verificationId,
    required String smsCode,
  }) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    return await _auth.signInWithCredential(credential);
  }

  // Demo Sign In for local testing without SMS rates
  Future<UserCredential?> signInDemoUser({
    required String name,
    required String phone,
  }) async {
    try {
      final userCred = await _auth.signInAnonymously();
      if (userCred.user != null) {
        await userCred.user!.updateDisplayName(name);
      }
      return userCred;
    } catch (e) {
      if (kDebugMode) {
        print('Demo auth error: $e');
      }
      return null;
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }
}
