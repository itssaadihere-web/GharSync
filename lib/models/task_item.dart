class TaskItem {
  final String taskId;
  final String title;
  final String assigneeName;
  final String dueText;
  final String status; // 'pending' | 'completed'
  final bool isSyncedToGoogleTasks;
  final DateTime createdAt;

  TaskItem({
    required this.taskId,
    required this.title,
    required this.assigneeName,
    required this.dueText,
    this.status = 'pending',
    this.isSyncedToGoogleTasks = true,
    required this.createdAt,
  });

  factory TaskItem.fromMap(String id, Map<String, dynamic> data) {
    return TaskItem(
      taskId: id,
      title: data['title'] ?? '',
      assigneeName: data['assigneeName'] ?? 'Family Member',
      dueText: data['dueText'] ?? 'Today',
      status: data['status'] ?? 'pending',
      isSyncedToGoogleTasks: data['isSyncedToGoogleTasks'] ?? true,
      createdAt: data['createdAt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(data['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'assigneeName': assigneeName,
      'dueText': dueText,
      'status': status,
      'isSyncedToGoogleTasks': isSyncedToGoogleTasks,
      'createdAt': createdAt.millisecondsSinceEpoch,
    };
  }
}
