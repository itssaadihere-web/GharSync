enum HouseholdRole { admin, member, runner }

extension HouseholdRoleExtension on HouseholdRole {
  String get roleName {
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

  factory Member.fromMap(String id, Map<String, dynamic> data) {
    return Member(
      userId: id,
      name: data['name'] ?? 'Family Member',
      phoneNumber: data['phoneNumber'] ?? '',
      role: HouseholdRoleExtension.fromString(data['role'] ?? 'member'),
      joinedAt: data['joinedAt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(data['joinedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'phoneNumber': phoneNumber,
      'role': role.roleName,
      'joinedAt': joinedAt.millisecondsSinceEpoch,
    };
  }
}
