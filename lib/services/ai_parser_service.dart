import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';
import '../models/list_item.dart';
import 'rule_based_parser.dart';

class AiParserService {
  final FirebaseFunctions _functions = FirebaseFunctions.instance;

  Future<ParsedResult> parseItemText(String input) async {
    final text = input.trim();
    if (text.isEmpty) {
      return RuleBasedParser.parse('');
    }

    try {
      final callable = _functions.httpsCallable('parseListItem');
      final response = await callable.call({'text': text}).timeout(
        const Duration(seconds: 4),
      );

      final data = response.data;
      if (data != null && data is Map) {
        final itemName = data['itemName']?.toString() ?? text;
        final quantity = (data['quantity'] as num?)?.toDouble() ?? 1.0;
        final unit = data['unit']?.toString() ?? 'pcs';
        final categoryStr = data['category']?.toString() ?? 'Other';

        return ParsedResult(
          itemName: itemName,
          quantity: quantity,
          unit: unit,
          category: ItemCategoryExtension.fromString(categoryStr),
        );
      }
    } catch (e) {
      if (kDebugMode) {
        print('Cloud Function parseListItem error or offline. Using local RuleBasedParser. Error: $e');
      }
    }

    // Instant local fallback
    return RuleBasedParser.parse(text);
  }
}
