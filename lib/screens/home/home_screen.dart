import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/list_item.dart';
import '../../providers/providers.dart';
import '../../theme/app_theme.dart';
import '../../widgets/add_item_sheet.dart';
import '../../widgets/item_tile.dart';
import '../../widgets/phase2_banners.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  ItemCategory? _selectedCategory;
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openAddItemModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => const AddItemSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final householdAsync = ref.watch(activeHouseholdStreamProvider);
    final activeItemsAsync = ref.watch(activeItemsStreamProvider);

    final householdName = householdAsync.value?.familyName ?? 'Our Family Household';

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAlignment.start,
          children: [
            Row(
              children: [
                const Text('🏡 '),
                Text(
                  householdName,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ],
            ),
            const Text(
              'Shared Real-Time Pantry List',
              style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: AppTheme.primaryEmerald, size: 28),
            onPressed: _openAddItemModal,
            tooltip: 'Add New Item',
          ),
        ],
      ),
      body: Column(
        children: [
          // Top Search & Category Filters
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Column(
              children: [
                // Category Filter Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      FilterChip(
                        label: const Text('All Items'),
                        selected: _selectedCategory == null,
                        onSelected: (val) => setState(() => _selectedCategory = null),
                        selectedColor: AppTheme.primaryEmerald.withOpacity(0.15),
                        labelStyle: TextStyle(
                          color: _selectedCategory == null ? AppTheme.primaryEmerald : AppTheme.textDark,
                          fontWeight: _selectedCategory == null ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                      const SizedBox(width: 8),
                      ...ItemCategory.values.map((cat) {
                        final isSelected = _selectedCategory == cat;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            avatar: Text(cat.emoji),
                            label: Text(cat.displayName),
                            selected: isSelected,
                            onSelected: (val) {
                              setState(() {
                                _selectedCategory = val ? cat : null;
                              });
                            },
                            selectedColor: AppTheme.primaryEmerald.withOpacity(0.15),
                            labelStyle: TextStyle(
                              color: isSelected ? AppTheme.primaryEmerald : AppTheme.textDark,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Main Real-Time Checklist Area
          Expanded(
            child: activeItemsAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppTheme.primaryEmerald),
              ),
              error: (err, stack) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Text('Error loading household list: $err'),
                ),
              ),
              data: (allItems) {
                // Filter by category if selected
                final items = _selectedCategory == null
                    ? allItems
                    : allItems.where((i) => i.category == _selectedCategory).toList();

                if (allItems.isEmpty) {
                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: CenterState.values.isNotEmpty ? MainAxisAlignment.center : MainAxisAlignment.start,
                      children: [
                        const SizedBox(height: 30),
                        Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryEmerald.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Center(
                            child: Text('🛒', style: TextStyle(fontSize: 48)),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Your list is empty — add the first item!',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 20),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tap the "+" button below or type "2 kilo aloo" to sync with your family in real time.',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _openAddItemModal,
                          icon: const Icon(Icons.add),
                          label: const Text('Add Grocery Item'),
                        ),
                        const SizedBox(height: 30),
                        const WhatsappBotBanner(),
                      ],
                    ),
                  );
                }

                return ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  children: [
                    // Price Estimator Header Card
                    PriceEstimatorCard(itemCount: items.length),
                    const SizedBox(height: 16),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Pending Items (${items.length})',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          'Swipe item to delete',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // List Items Stream Render
                    ...items.map((item) => ItemTile(item: item, isShoppingMode: false)),

                    const SizedBox(height: 16),
                    const WhatsappBotBanner(),
                    const SizedBox(height: 80), // Padding for Floating FAB
                  ],
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddItemModal,
        backgroundColor: AppTheme.primaryEmerald,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_shopping_cart),
        label: const Text(
          'Quick Add Item',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

enum CenterState { values }
