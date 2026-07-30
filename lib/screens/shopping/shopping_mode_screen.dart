import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/list_item.dart';
import '../../providers/providers.dart';
import '../../theme/app_theme.dart';
import '../../widgets/item_tile.dart';

class ShoppingModeScreen extends ConsumerWidget {
  const ShoppingModeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final groupedItemsMap = ref.watch(groupedActiveItemsProvider);
    final activeItemsAsync = ref.watch(activeItemsStreamProvider);

    final totalItemsCount = activeItemsAsync.value?.length ?? 0;

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        backgroundColor: AppTheme.primaryDarkEmerald,
        foregroundColor: Colors.white,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.shopping_bag, color: AppTheme.accentAmber, size: 22),
                SizedBox(width: 8),
                Text(
                  'Runner Shopping Mode',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 19, color: Colors.white),
                ),
              ],
            ),
            const Text(
              'Distraction-free store aisle layout with large tap targets',
              style: TextStyle(fontSize: 11, color: Colors.white70),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.accentAmber,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$totalItemsCount Left',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
      body: activeItemsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.primaryEmerald),
        ),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (items) {
          if (items.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('🎉', style: TextStyle(fontSize: 64)),
                    const SizedBox(height: 16),
                    Text(
                      'All Shopping Done!',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: 22,
                            color: AppTheme.primaryDarkEmerald,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'There are no pending items left on your household list. Great job!',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Large Banner for Runner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.accentAmber.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.touch_app, color: AppTheme.accentAmber, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Tap item icon or card once to mark as bought. Household members get updated instantly!',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey.shade800,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Grouped by Category Store Aisles
              ...groupedItemsMap.entries.map((entry) {
                final category = entry.key;
                final categoryItems = entry.value;

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Store Aisle Category Header
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
                      child: Row(
                        children: [
                          Text(
                            category.emoji,
                            style: const TextStyle(fontSize: 22),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            category.displayName.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.1,
                              color: AppTheme.primaryDarkEmerald,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryEmerald.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${categoryItems.length}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryEmerald,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Items in this category
                    ...categoryItems.map((item) => ItemTile(item: item, isShoppingMode: true)),

                    const SizedBox(height: 12),
                  ],
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
