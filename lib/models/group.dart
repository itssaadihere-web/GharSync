import 'package:cloud_firestore/cloud_firestore.dart';

enum GroupType { family, office, friends }

class Group {
  final String groupId;
  final String groupName;
  final GroupType type;
  final String avatar;
  final String lastMessage;
  final DateTime lastTime;
  final int unreadCount;
  final int memberCount;

  Group({
    required this.groupId,
    required this.groupName,
    this.type = GroupType.family,
    this.avatar = '🏡',
    this.lastMessage = '',
    required this.lastTime,
    this.unreadCount = 0,
    this.memberCount = 1,
  });

  factory Group.fromFirestore(DocumentSnapshot<Map<String, dynamic>> snapshot) {
    final data = snapshot.data() ?? {};
    return Group(
      groupId: snapshot.id,
      groupName: data['groupName'] ?? 'Family Group',
      type: data['type'] == 'office' ? GroupType.office : (data['type'] == 'friends' ? GroupType.friends : GroupType.family),
      avatar: data['avatar'] ?? '🏡',
      lastMessage: data['lastMessage'] ?? '',
      lastTime: (data['lastTime'] as Timestamp?)?.toDate() ?? DateTime.now(),
      unreadCount: data['unreadCount'] ?? 0,
      memberCount: data['memberCount'] ?? 1,
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'groupName': groupName,
      'type': type.name,
      'avatar': avatar,
      'lastMessage': lastMessage,
      'lastTime': Timestamp.fromDate(lastTime),
      'unreadCount': unreadCount,
      'memberCount': memberCount,
    };
  }
}
