import 'package:flutter/foundation.dart';
import 'rule_based_parser.dart';

class AiParserService {
  Future<ParsedResult> parseItemText(String rawText) async {
    try {
      return RuleBasedParser.parse(rawText);
    } catch (e) {
      if (kDebugMode) {
        print('AI Parsing Error: $e');
      }
      return RuleBasedParser.parse(rawText);
    }
  }
}
