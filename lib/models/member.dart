import 'package:cloud_firestore/cloud_firestore.dart';

enum HouseholdRole { admin, member, runner }

extension HouseholdRoleExtension on HouseholdRole {
  String get name {
    switch (this) {
      case HouseholdRole.admin:
        return 'admin';
      case HouseholdRole.member:
        return 'member';
      case HouseholdRole.runner:
        return 'runner';
    }
  }

  static HouseholdRole fromString(String role) {
    switch (role.toLowerCase()) {
      case 'admin':
        return HouseholdRole.admin;
      case 'runner':
        return HouseholdRole.runner;
      case 'member':
      default:
        return HouseholdRole.member;
    }
  }
}

class Member {
  final String userId;
  final String name;
  final String phoneNumber;
  final HouseholdRole role;
  final DateTime joinedAt;

  Member({
    required this.userId,
    required this.name,
    required this.phoneNumber,
    this.role = HouseholdRole.member,
    required this.joinedAt,
  });

  factory Member.fromFirestore(DocumentSnapshot<Map<String, dynamic>> snapshot) {
    final data = snapshot.data() ?? {};
    return Member(
      userId: snapshot.id,
      name: data['name'] ?? 'Family Member',
      phoneNumber: data['phoneNumber'] ?? '',
      role: HouseholdRoleExtension.fromString(data['role'] ?? 'member'),
      joinedAt: (data['joinedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'phoneNumber': phoneNumber,
      'role': role.name,
      'joinedAt': Timestamp.fromDate(joinedAt),
    };
  }
}
