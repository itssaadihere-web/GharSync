import 'package:cloud_firestore/cloud_firestore.dart';

enum MessageType { chat, purchase, task }

class ChatMessage {
  final String messageId;
  final String senderId;
  final String senderName;
  final String text;
  final MessageType type;
  final Map<String, dynamic>? extractedData;
  final DateTime timestamp;

  ChatMessage({
    required this.messageId,
    required this.senderId,
    required this.senderName,
    required this.text,
    this.type = MessageType.chat,
    this.extractedData,
    required this.timestamp,
  });

  factory ChatMessage.fromFirestore(DocumentSnapshot<Map<String, dynamic>> snapshot) {
    final data = snapshot.data() ?? {};
    final typeStr = data['type'] ?? 'chat';
    return ChatMessage(
      messageId: snapshot.id,
      senderId: data['senderId'] ?? '',
      senderName: data['senderName'] ?? 'Member',
      text: data['text'] ?? '',
      type: typeStr == 'purchase' ? MessageType.purchase : (typeStr == 'task' ? MessageType.task : MessageType.chat),
      extractedData: data['extractedData'] != null ? Map<String, dynamic>.from(data['extractedData']) : null,
      timestamp: (data['timestamp'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'senderId': senderId,
      'senderName': senderName,
      'text': text,
      'type': type.name,
      'extractedData': extractedData,
      'timestamp': Timestamp.fromDate(timestamp),
    };
  }
}
