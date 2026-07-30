import '../models/list_item.dart';

class ParsedResult {
  final String itemName;
  final double quantity;
  final String unit;
  final ItemCategory category;

  ParsedResult({
    required this.itemName,
    required this.quantity,
    required this.unit,
    required this.category,
  });
}

class RuleBasedParser {
  static ParsedResult parse(String input) {
    String raw = input.trim();
    if (raw.isEmpty) {
      return ParsedResult(
        itemName: '',
        quantity: 1.0,
        unit: 'pcs',
        category: ItemCategory.other,
      );
    }

    String lower = raw.toLowerCase();

    // Step 1: Strip leading conversational intent words (e.g. "mujhe", "i want", "please get", "مجھے")
    lower = _stripLeadingIntents(lower);

    // Step 2: Strip trailing conversational verbs & filler words (e.g. "chahiye", "lekar aao", "laana hai", "چاہیے")
    lower = _stripTrailingFillers(lower);

    double quantity = 1.0;
    String unit = 'pcs';
    String itemName = lower;

    // Step 3: Extract Urdu Script and Roman Urdu Number Words at beginning
    final numberExtraction = _extractNumberWord(lower);
    if (numberExtraction.hasNumber) {
      quantity = numberExtraction.quantity;
      if (numberExtraction.unit != null) {
        unit = numberExtraction.unit!;
      }
      lower = numberExtraction.remainingText;
      itemName = lower;
    }

    // Step 4: Extract digit quantity + unit + item name (e.g. "5000 pizza", "2 kg aloo")
    final numUnitNameRegex = RegExp(r'^([\d\.\/]+)\s*([a-zA-Z]*)\s+(.+)$');
    final match = numUnitNameRegex.firstMatch(lower);

    if (match != null) {
      final rawNum = match.group(1)!;
      final rawUnit = match.group(2) ?? '';
      final rawName = match.group(3) ?? lower;

      quantity = _parseQuantity(rawNum);
      if (rawUnit.isNotEmpty) {
        unit = _normalizeUnit(rawUnit);
      }
      itemName = rawName;
    }

    // Step 5: Clean remaining trailing fillers again if number extraction uncovered trailing words
    itemName = _stripTrailingFillers(itemName);

    // Step 6: Extract unit if embedded inside item name
    if (unit == 'pcs') {
      final unitExtraction = _extractUnitFromName(itemName);
      unit = unitExtraction.unit;
      itemName = unitExtraction.cleanName;
    }

    // Step 7: Clean connector words e.g. "ke", "k", "walay"
    itemName = _cleanConnectorWords(itemName);

    // Step 8: Final formatting
    itemName = _capitalizeWords(itemName.replaceAll(RegExp(r'\s+'), ' ').trim());
    if (itemName.isEmpty) itemName = _capitalizeWords(raw);

    final category = _categorize(itemName);

    return ParsedResult(
      itemName: itemName,
      quantity: quantity,
      unit: unit,
      category: category,
    );
  }

  static String _stripLeadingIntents(String text) {
    String t = text;
    final leadingPatterns = [
      r'^\b(please|plz|mujhe|hameen|humko|kindly|can you|bring me|get me|buy me|need|i want|want|mujhe\s+bhi|mujhy)\b\s*',
      r'^(مجھے|ہمیں|ہمارے لیے|برائے مہربانی|چاہیے)\s*',
    ];

    for (var pat in leadingPatterns) {
      t = t.replaceFirst(RegExp(pat, caseSensitive: false, unicode: true), '');
    }
    return t.trim();
  }

  static String _stripTrailingFillers(String text) {
    String t = text;

    final trailingPatterns = [
      // Roman Urdu & English Fillers
      r'\b(chahiye|chahie|chaheay|chahey|chahye|zaroorat\s+hai|zaroori\s+hai|zaroor\s+laana)\b',
      r'\b(lekar\s+aao|lekar\s+aana|lekar\s+aane|lekar\s+aen|le\s+kar\s+aao|le\s+kar\s+aana)\b',
      r'\b(le\s+aao|le\s+aana|le\s+aen|le\s+ke\s+aao|le\s+ke\s+aana|le\s+ao)\b',
      r'\b(laana\s+hai|lana\s+hai|lani\s+hai|laane\s+hain|laao|lana|lani)\b',
      r'\b(mangwa\s+do|mangwa\s+dein|bhej\s+do|bhej\s+dein|xareed\s+lo|khareed\s+laao)\b',
      r'\b(bhi|bhee|please|plz|phir|se|de\s+do|doh)\b',
      // Urdu Script Fillers
      r'(چاہیے|چاہئیے|ضرورت ہے|ضروری ہے|لانا ہے|لاؤ|لاو|لے آؤ|لے آؤ|منگوا دو|بھیج دو|خرید لو|بھی)',
    ];

    for (var pattern in trailingPatterns) {
      t = t.replaceAll(RegExp(pattern, caseSensitive: false, unicode: true), ' ');
    }

    return t.replaceAll(RegExp(r'\s+'), ' ').trim();
  }

  static _NumberResult _extractNumberWord(String text) {
    final t = text.trim();

    // Urdu Script Numbers
    if (RegExp(r'^(ایک|1)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 1.0, remainingText: t.replaceFirst(RegExp(r'^(ایک|1)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(دو|2)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 2.0, remainingText: t.replaceFirst(RegExp(r'^(دو|2)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(تین|3)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 3.0, remainingText: t.replaceFirst(RegExp(r'^(تین|3)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(چار|4)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 4.0, remainingText: t.replaceFirst(RegExp(r'^(چار|4)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(پانچ|5)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 5.0, remainingText: t.replaceFirst(RegExp(r'^(پانچ|5)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(چھ|6)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 6.0, remainingText: t.replaceFirst(RegExp(r'^(چھ|6)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(سات|7)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 7.0, remainingText: t.replaceFirst(RegExp(r'^(سات|7)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(آٹھ|8)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 8.0, remainingText: t.replaceFirst(RegExp(r'^(آٹھ|8)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(نو|9)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 9.0, remainingText: t.replaceFirst(RegExp(r'^(نو|9)\s*', unicode: true), ''));
    }
    if (RegExp(r'^(دس|10)\s*', unicode: true).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 10.0, remainingText: t.replaceFirst(RegExp(r'^(دس|10)\s*', unicode: true), ''));
    }

    // Roman Urdu & English Numbers
    if (RegExp(r'^\b(aadha|adha|half)\b', caseSensitive: false).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 0.5, remainingText: t.replaceFirst(RegExp(r'^\b(aadha|adha|half)\b\s*', caseSensitive: false), ''));
    }
    if (RegExp(r'^\b(pao|paao)\b', caseSensitive: false).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 0.25, unit: 'kg', remainingText: t.replaceFirst(RegExp(r'^\b(pao|paao)\b\s*', caseSensitive: false), ''));
    }
    if (RegExp(r'^\b(ek|aik|one|1)\b', caseSensitive: false).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 1.0, remainingText: t.replaceFirst(RegExp(r'^\b(ek|aik|one|1)\b\s*', caseSensitive: false), ''));
    }
    if (RegExp(r'^\b(do|two|2)\b', caseSensitive: false).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 2.0, remainingText: t.replaceFirst(RegExp(r'^\b(do|two|2)\b\s*', caseSensitive: false), ''));
    }
    if (RegExp(r'^\b(teen|tin|three|3)\b', caseSensitive: false).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 3.0, remainingText: t.replaceFirst(RegExp(r'^\b(teen|tin|three|3)\b\s*', caseSensitive: false), ''));
    }
    if (RegExp(r'^\b(chaar|char|four|4)\b', caseSensitive: false).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 4.0, remainingText: t.replaceFirst(RegExp(r'^\b(chaar|char|four|4)\b\s*', caseSensitive: false), ''));
    }
    if (RegExp(r'^\b(paanch|panch|five|5)\b', caseSensitive: false).hasMatch(t)) {
      return _NumberResult(hasNumber: true, quantity: 5.0, remainingText: t.replaceFirst(RegExp(r'^\b(paanch|panch|five|5)\b\s*', caseSensitive: false), ''));
    }

    return _NumberResult(hasNumber: false, quantity: 1.0, remainingText: t);
  }

  static _UnitResult _extractUnitFromName(String text) {
    String unit = 'pcs';
    String clean = text;

    if (RegExp(r'\b(kilo|kg|kilogram|kilos)\b', caseSensitive: false).hasMatch(clean)) {
      unit = 'kg';
      clean = clean.replaceAll(RegExp(r'\b(kilo|kg|kilogram|kilos)\b', caseSensitive: false), '');
    } else if (RegExp(r'\b(liter|litre|ltr|liters)\b', caseSensitive: false).hasMatch(clean)) {
      unit = 'liter';
      clean = clean.replaceAll(RegExp(r'\b(liter|litre|ltr|liters)\b', caseSensitive: false), '');
    } else if (RegExp(r'\b(dozen|dazan|dazzen)\b', caseSensitive: false).hasMatch(clean)) {
      unit = 'dozen';
      clean = clean.replaceAll(RegExp(r'\b(dozen|dazan|dazzen)\b', caseSensitive: false), '');
    } else if (RegExp(r'\b(gram|gm|grams)\b', caseSensitive: false).hasMatch(clean)) {
      unit = 'gram';
      clean = clean.replaceAll(RegExp(r'\b(gram|gm|grams)\b', caseSensitive: false), '');
    } else if (RegExp(r'\b(packet|pkt|packets)\b', caseSensitive: false).hasMatch(clean)) {
      unit = 'packet';
      clean = clean.replaceAll(RegExp(r'\b(packet|pkt|packets)\b', caseSensitive: false), '');
    }

    return _UnitResult(unit: unit, cleanName: clean.trim());
  }

  static String _cleanConnectorWords(String text) {
    return text.replaceAll(RegExp(r'\b(ke|k|wala|wali|walay)\b', caseSensitive: false), ' ').replaceAll(RegExp(r'\s+'), ' ').trim();
  }

  static double _parseQuantity(String q) {
    if (q.contains('/')) {
      final parts = q.split('/');
      if (parts.length == 2) {
        final num = double.tryParse(parts[0]) ?? 1.0;
        final den = double.tryParse(parts[1]) ?? 1.0;
        return den != 0 ? num / den : 1.0;
      }
    }
    return double.tryParse(q) ?? 1.0;
  }

  static String _normalizeUnit(String u) {
    final lower = u.toLowerCase();
    if (['kg', 'kilo', 'kilogram', 'kilos'].contains(lower)) return 'kg';
    if (['g', 'gram', 'grams', 'gm'].contains(lower)) return 'gram';
    if (['l', 'liter', 'litre', 'liters', 'ltr'].contains(lower)) return 'liter';
    if (['pkt', 'packet', 'packets'].contains(lower)) return 'packet';
    if (['doz', 'dozen', 'dazan', 'dazzen'].contains(lower)) return 'dozen';
    if (['bot', 'bottle', 'bottles'].contains(lower)) return 'bottle';
    if (['box', 'boxes'].contains(lower)) return 'box';
    return lower;
  }

  static ItemCategory _categorize(String name) {
    final lower = name.toLowerCase();

    if (RegExp(r'\b(aloo|pyaz|tamatar|khera|palak|coriander|dhaniya|pudina|ginger|adrak|garlic|lahsan|sabzi|onion|potato|tomato|cucumber|spinach|lemon|nimbu|gobi|cabbage|matar|peas|ladyfinger|bhindi)\b').hasMatch(lower)) {
      return ItemCategory.vegetables;
    }
    if (RegExp(r'\b(doodh|milk|dahi|yogurt|butter|makhan|cheese|cream|malai|egg|eggs|anda|ande)\b').hasMatch(lower)) {
      return ItemCategory.dairy;
    }
    if (RegExp(r'\b(soap|sabun|dettol|shampoo|toothpaste|paste|surf|detergent|tissue|harpic|handwash|towel|cleaner|brush|sanitizer)\b').hasMatch(lower)) {
      return ItemCategory.toiletries;
    }
    if (RegExp(r'\b(panadol|disprin|bandage|medicine|syrup|tablet|tablets|ointment|pharmacy|b-complex|paracetamol|calpol|pills|capsule)\b').hasMatch(lower)) {
      return ItemCategory.medical;
    }
    if (RegExp(r'\b(atta|flour|rice|chawal|ghee|oil|daal|dal|sugar|chini|salt|namak|spice|spices|tea|chai|patti|bread|biscuit|dryfruit|badam|pasta|noodle|pizza|burger)\b').hasMatch(lower)) {
      return ItemCategory.grocery;
    }

    return ItemCategory.other;
  }

  static String _capitalizeWords(String str) {
    if (str.isEmpty) return str;
    return str.split(' ').map((word) {
      if (word.isEmpty) return word;
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  }
}

class _NumberResult {
  final bool hasNumber;
  final double quantity;
  final String? unit;
  final String remainingText;

  _NumberResult({
    required this.hasNumber,
    required this.quantity,
    this.unit,
    required this.remainingText,
  });
}

class _UnitResult {
  final String unit;
  final String cleanName;

  _UnitResult({required this.unit, required this.cleanName});
}
