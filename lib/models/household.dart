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

  factory Household.fromMap(String id, Map<String, dynamic> data) {
    return Household(
      householdId: id,
      familyName: data['familyName'] ?? 'My Family Household',
      subscriptionStatus: data['subscriptionStatus'] ?? 'free',
      createdAt: data['createdAt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(data['createdAt'])
          : DateTime.now(),
      memberCount: data['memberCount'] ?? 1,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'familyName': familyName,
      'subscriptionStatus': subscriptionStatus,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'memberCount': memberCount,
    };
  }
}
