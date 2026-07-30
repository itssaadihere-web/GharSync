enum ItemCategory {
  vegetables,
  dairy,
  toiletries,
  medical,
  grocery,
  other,
}

extension ItemCategoryExtension on ItemCategory {
  String get displayName {
    switch (this) {
      case ItemCategory.vegetables:
        return 'Vegetables';
      case ItemCategory.dairy:
        return 'Dairy';
      case ItemCategory.toiletries:
        return 'Toiletries';
      case ItemCategory.medical:
        return 'Medical';
      case ItemCategory.grocery:
        return 'Grocery';
      case ItemCategory.other:
        return 'Other';
    }
  }

  String get emoji {
    switch (this) {
      case ItemCategory.vegetables:
        return '🥦';
      case ItemCategory.dairy:
        return '🥛';
      case ItemCategory.toiletries:
        return '🧼';
      case ItemCategory.medical:
        return '💊';
      case ItemCategory.grocery:
        return '🌾';
      case ItemCategory.other:
        return '📦';
    }
  }

  static ItemCategory fromString(String cat) {
    switch (cat.trim().toLowerCase()) {
      case 'vegetables':
      case 'veggies':
        return ItemCategory.vegetables;
      case 'dairy':
        return ItemCategory.dairy;
      case 'toiletries':
        return ItemCategory.toiletries;
      case 'medical':
      case 'medicine':
        return ItemCategory.medical;
      case 'grocery':
      case 'groceries':
        return ItemCategory.grocery;
      default:
        return ItemCategory.other;
    }
  }
}

class UserReference {
  final String userId;
  final String name;

  UserReference({required this.userId, required this.name});

  factory UserReference.fromMap(Map<String, dynamic>? map) {
    return UserReference(
      userId: map?['userId'] ?? '',
      name: map?['name'] ?? 'Family Member',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'name': name,
    };
  }
}

class ListItem {
  final String itemId;
  final String itemName;
  final double quantity;
  final String unit;
  final ItemCategory category;
  final String status; // 'pending' | 'bought'
  final UserReference addedBy;
  final UserReference? boughtBy;
  final DateTime createdAt;
  final DateTime? boughtAt;

  ListItem({
    required this.itemId,
    required this.itemName,
    this.quantity = 1.0,
    this.unit = 'pcs',
    this.category = ItemCategory.other,
    this.status = 'pending',
    required this.addedBy,
    this.boughtBy,
    required this.createdAt,
    this.boughtAt,
  });

  bool get isBought => status == 'bought';

  factory ListItem.fromMap(String id, Map<String, dynamic> data) {
    return ListItem(
      itemId: id,
      itemName: data['itemName'] ?? '',
      quantity: (data['quantity'] as num?)?.toDouble() ?? 1.0,
      unit: data['unit'] ?? 'pcs',
      category: ItemCategoryExtension.fromString(data['category'] ?? 'Other'),
      status: data['status'] ?? 'pending',
      addedBy: UserReference.fromMap(data['addedBy']),
      boughtBy: data['boughtBy'] != null ? UserReference.fromMap(data['boughtBy']) : null,
      createdAt: data['createdAt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(data['createdAt'])
          : DateTime.now(),
      boughtAt: data['boughtAt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(data['boughtAt'])
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'itemName': itemName,
      'quantity': quantity,
      'unit': unit,
      'category': category.displayName,
      'status': status,
      'addedBy': addedBy.toMap(),
      'boughtBy': boughtBy?.toMap(),
      'createdAt': createdAt.millisecondsSinceEpoch,
      'boughtAt': boughtAt?.millisecondsSinceEpoch,
    };
  }

  ListItem copyWith({
    String? itemName,
    double? quantity,
    String? unit,
    ItemCategory? category,
    String? status,
    UserReference? addedBy,
    UserReference? boughtBy,
    DateTime? boughtAt,
  }) {
    return ListItem(
      itemId: itemId,
      itemName: itemName ?? this.itemName,
      quantity: quantity ?? this.quantity,
      unit: unit ?? this.unit,
      category: category ?? this.category,
      status: status ?? this.status,
      addedBy: addedBy ?? this.addedBy,
      boughtBy: boughtBy ?? this.boughtBy,
      createdAt: createdAt,
      boughtAt: boughtAt ?? this.boughtAt,
    );
  }
}
