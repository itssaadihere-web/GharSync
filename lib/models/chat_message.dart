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

  factory ChatMessage.fromMap(String id, Map<String, dynamic> data) {
    final typeStr = data['type'] ?? 'chat';
    return ChatMessage(
      messageId: id,
      senderId: data['senderId'] ?? '',
      senderName: data['senderName'] ?? 'Member',
      text: data['text'] ?? '',
      type: typeStr == 'purchase'
          ? MessageType.purchase
          : (typeStr == 'task' ? MessageType.task : MessageType.chat),
      extractedData: data['extractedData'] != null
          ? Map<String, dynamic>.from(data['extractedData'])
          : null,
      timestamp: data['timestamp'] != null
          ? DateTime.fromMillisecondsSinceEpoch(data['timestamp'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'senderId': senderId,
      'senderName': senderName,
      'text': text,
      'type': type.name,
      'extractedData': extractedData,
      'timestamp': timestamp.millisecondsSinceEpoch,
    };
  }
}
