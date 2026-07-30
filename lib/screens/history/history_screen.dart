import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../providers/providers.dart';
import '../../theme/app_theme.dart';
import '../../widgets/item_tile.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(historyItemsStreamProvider);
    final householdId = ref.watch(activeHouseholdIdProvider);
    final firestoreService = ref.read(firestoreServiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('📜 Household Purchase History'),
      ),
      body: historyAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppTheme.primaryEmerald),
        ),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (boughtItems) {
          if (boughtItems.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.history_outlined, size: 64, color: AppTheme.textMuted),
                    const SizedBox(height: 16),
                    Text(
                      'No Bought History Yet',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Items bought by household members over the last 30 days will be preserved here so nothing is ever lost.',
                      style: TextStyle(color: Colors.grey.shade600),
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
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primaryEmerald.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: AppTheme.primaryEmerald, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Showing items bought in the last 30 days. Tap any item to add it back to your active list.',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade800),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              ...boughtItems.map((item) {
                return Column(
                  children: [
                    ItemTile(item: item, isShoppingMode: false),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: () {
                          if (householdId == null) return;
                          firestoreService.markItemPending(
                            householdId: householdId,
                            itemId: item.itemId,
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Re-added "${item.itemName}" to active list!'),
                            ),
                          );
                        },
                        icon: const Icon(Icons.replay, size: 16, color: AppTheme.primaryEmerald),
                        label: const Text(
                          'Add Back to List',
                          style: TextStyle(color: AppTheme.primaryEmerald, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
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
