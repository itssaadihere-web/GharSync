import 'package:cloud_firestore/cloud_firestore.dart';

class Household {
  final String householdId;
  final String familyName;
  final String subscriptionStatus; // 'free' | 'premium'
  final DateTime createdAt;
  final int memberCount;

  Household({
    required this.householdId,
    required this.familyName,
    this.subscriptionStatus = 'free',
    required this.createdAt,
    this.memberCount = 1,
  });

  factory Household.fromFirestore(DocumentSnapshot<Map<String, dynamic>> snapshot) {
    final data = snapshot.data() ?? {};
    return Household(
      householdId: snapshot.id,
      familyName: data['familyName'] ?? 'My Family Household',
      subscriptionStatus: data['subscriptionStatus'] ?? 'free',
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      memberCount: data['memberCount'] ?? 1,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'familyName': familyName,
      'subscriptionStatus': subscriptionStatus,
      'createdAt': Timestamp.fromDate(createdAt),
      'memberCount': memberCount,
    };
  }
}
