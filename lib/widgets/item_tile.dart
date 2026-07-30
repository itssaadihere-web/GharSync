import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/list_item.dart';
import '../providers/providers.dart';
import '../theme/app_theme.dart';

class ItemTile extends ConsumerWidget {
  final ListItem item;
  final bool isShoppingMode;

  const ItemTile({
    super.key,
    required this.item,
    this.isShoppingMode = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final householdId = ref.watch(activeHouseholdIdProvider);
    final currentUser = ref.watch(authStateProvider);
    final currentUserId = currentUser?.uid ?? 'demo-user';
    final currentUserName = ref.watch(currentUserNameProvider);
    final firestoreService = ref.read(firestoreServiceProvider);

    final isBought = item.isBought;

    return Dismissible(
      key: Key(item.itemId),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.red.shade400,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white, size: 28),
      ),
      onDismissed: (_) {
        if (householdId != null) {
          firestoreService.deleteItem(householdId: householdId, itemId: item.itemId);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${item.itemName} removed from list')),
          );
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: isBought ? Colors.grey.shade100 : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isBought ? Colors.grey.shade300 : AppTheme.primaryEmerald.withOpacity(0.15),
            width: 1,
          ),
          boxShadow: isBought
              ? []
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            if (householdId == null) return;
            if (isBought) {
              firestoreService.markItemPending(householdId: householdId, itemId: item.itemId);
            } else {
              firestoreService.markItemBought(
                householdId: householdId,
                itemId: item.itemId,
                currentUserId: currentUserId,
                currentUserName: currentUserName,
              );
            }
          },
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: isShoppingMode ? 16 : 12,
            ),
            child: Row(
              children: [
                // Category Emoji & Checkbox Target
                GestureDetector(
                  onTap: () {
                    if (householdId == null) return;
                    if (isBought) {
                      firestoreService.markItemPending(householdId: householdId, itemId: item.itemId);
                    } else {
                      firestoreService.markItemBought(
                        householdId: householdId,
                        itemId: item.itemId,
                        currentUserId: currentUserId,
                        currentUserName: currentUserName,
                      );
                    }
                  },
                  child: Container(
                    width: isShoppingMode ? 44 : 38,
                    height: isShoppingMode ? 44 : 38,
                    decoration: BoxDecoration(
                      color: isBought
                          ? AppTheme.primaryEmerald
                          : AppTheme.primaryEmerald.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: isBought
                          ? const Icon(Icons.check, color: Colors.white, size: 24)
                          : Text(
                              item.category.emoji,
                              style: TextStyle(fontSize: isShoppingMode ? 22 : 18),
                            ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),

                // Item Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item.itemName,
                              style: TextStyle(
                                fontSize: isShoppingMode ? 18 : 16,
                                fontWeight: FontWeight.bold,
                                decoration: isBought ? TextDecoration.lineThrough : null,
                                color: isBought ? Colors.grey.shade500 : AppTheme.textDark,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: isBought
                                  ? Colors.grey.shade200
                                  : AppTheme.primaryEmerald.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '${item.quantity % 1 == 0 ? item.quantity.toInt() : item.quantity} ${item.unit}',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: isShoppingMode ? 15 : 13,
                                color: isBought ? Colors.grey.shade600 : AppTheme.primaryEmerald,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),

                      // Meta info: who added / who bought
                      Row(
                        children: [
                          Icon(
                            Icons.person_outline,
                            size: 13,
                            color: Colors.grey.shade500,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isBought && item.boughtBy != null
                                ? 'Bought by ${item.boughtBy!.name} • ${DateFormat('jm').format(item.boughtAt ?? item.createdAt)}'
                                : 'Added by ${item.addedBy.name}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            item.category.displayName,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: Colors.grey.shade500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
