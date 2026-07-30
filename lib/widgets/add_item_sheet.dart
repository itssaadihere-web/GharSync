import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/list_item.dart';
import '../providers/providers.dart';
import '../services/rule_based_parser.dart';
import '../theme/app_theme.dart';

class AddItemSheet extends ConsumerStatefulWidget {
  const AddItemSheet({super.key});

  @override
  ConsumerState<AddItemSheet> createState() => _AddItemSheetState();
}

class _AddItemSheetState extends ConsumerState<AddItemSheet> {
  final TextEditingController _controller = TextEditingController();
  ParsedResult? _liveParsed;
  bool _isParsing = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onTextChanged);
  }

  void _onTextChanged() {
    final text = _controller.text.trim();
    if (text.isNotEmpty) {
      setState(() {
        _liveParsed = RuleBasedParser.parse(text);
      });
    } else {
      setState(() {
        _liveParsed = null;
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _submitItem() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    final householdId = ref.read(activeHouseholdIdProvider);
    final currentUserId = ref.read(authStateProvider).value?.uid ?? 'demo-user';
    final currentUserName = ref.read(currentUserNameProvider);
    final firestoreService = ref.read(firestoreServiceProvider);
    final aiService = ref.read(aiParserServiceProvider);

    if (householdId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select or create a household first.')),
      );
      return;
    }

    setState(() {
      _isParsing = true;
    });

    // Run AI/Rule parser
    final parsed = await aiService.parseItemText(text);

    await firestoreService.addItem(
      householdId: householdId,
      itemName: parsed.itemName,
      quantity: parsed.quantity,
      unit: parsed.unit,
      category: parsed.category,
      currentUserId: currentUserId,
      currentUserName: currentUserName,
    );

    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Added "${parsed.itemName}" to ${parsed.category.displayName}!'),
          backgroundColor: AppTheme.primaryEmerald,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Add Household Item',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Type freely in English or Roman Urdu (e.g. "2 kilo aloo", "dettol soap", "1/2 dozen eggs")',
            style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 16),

          // Input field with Voice Note Stub Icon
          TextField(
            controller: _controller,
            autofocus: true,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              hintText: 'e.g. 2 kilo aloo, 1 liter doodh...',
              prefixIcon: const Icon(Icons.shopping_basket_outlined, color: AppTheme.primaryEmerald),
              suffixIcon: IconButton(
                icon: const Icon(Icons.mic, color: AppTheme.accentAmber),
                tooltip: 'Voice Note Input (Phase 2)',
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('🎙️ Voice Note Parsing is a Phase 2 Premium feature! Scaffolded UI ready.'),
                    ),
                  );
                },
              ),
            ),
            onSubmitted: (_) => _submitItem(),
          ),

          const SizedBox(height: 14),

          // AI Live Parsing Preview Chips
          if (_liveParsed != null && _liveParsed!.itemName.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.primaryEmerald.withOpacity(0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.primaryEmerald.withOpacity(0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.auto_awesome, size: 16, color: AppTheme.primaryEmerald),
                      const SizedBox(width: 6),
                      Text(
                        'AI Auto-Category & Quantity Detection',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryEmerald,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      Chip(
                        avatar: Text(_liveParsed!.category.emoji),
                        label: Text(_liveParsed!.category.displayName),
                        backgroundColor: Colors.white,
                      ),
                      Chip(
                        label: Text('Item: ${_liveParsed!.itemName}'),
                        backgroundColor: Colors.white,
                      ),
                      Chip(
                        label: Text('Qty: ${_liveParsed!.quantity % 1 == 0 ? _liveParsed!.quantity.toInt() : _liveParsed!.quantity} ${_liveParsed!.unit}'),
                        backgroundColor: Colors.white,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Submit Button
          ElevatedButton(
            onPressed: _isParsing ? null : _submitItem,
            child: _isParsing
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                  )
                : const Text('Add to Household List'),
          ),
        ],
      ),
    );
  }
}
