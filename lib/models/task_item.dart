import 'package:cloud_firestore/cloud_firestore.dart';

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

  factory TaskItem.fromFirestore(DocumentSnapshot<Map<String, dynamic>> snapshot) {
    final data = snapshot.data() ?? {};
    return TaskItem(
      taskId: snapshot.id,
      title: data['title'] ?? '',
      assigneeName: data['assigneeName'] ?? 'Family Member',
      dueText: data['dueText'] ?? 'Today',
      status: data['status'] ?? 'pending',
      isSyncedToGoogleTasks: data['isSyncedToGoogleTasks'] ?? true,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'title': title,
      'assigneeName': assigneeName,
      'dueText': dueText,
      'status': status,
      'isSyncedToGoogleTasks': isSyncedToGoogleTasks,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
