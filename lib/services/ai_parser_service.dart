import 'package:flutter/foundation.dart';
import 'rule_based_parser.dart';

class AiParserService {
  final RuleBasedParser _fallbackParser = RuleBasedParser();

  Future<ParsedItem> parseItemText(String rawText) async {
    try {
      return _fallbackParser.parse(rawText);
    } catch (e) {
      if (kDebugMode) {
        print('AI Parsing Error: $e');
      }
      return _fallbackParser.parse(rawText);
    }
  }
}
