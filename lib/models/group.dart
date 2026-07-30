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

  factory Group.fromMap(String id, Map<String, dynamic> data) {
    return Group(
      groupId: id,
      groupName: data['groupName'] ?? 'Family Group',
      type: data['type'] == 'office'
          ? GroupType.office
          : (data['type'] == 'friends' ? GroupType.friends : GroupType.family),
      avatar: data['avatar'] ?? '🏡',
      lastMessage: data['lastMessage'] ?? '',
      lastTime: data['lastTime'] != null
          ? DateTime.fromMillisecondsSinceEpoch(data['lastTime'])
          : DateTime.now(),
      unreadCount: data['unreadCount'] ?? 0,
      memberCount: data['memberCount'] ?? 1,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'groupName': groupName,
      'type': type.name,
      'avatar': avatar,
      'lastMessage': lastMessage,
      'lastTime': lastTime.millisecondsSinceEpoch,
      'unreadCount': unreadCount,
      'memberCount': memberCount,
    };
  }
}
