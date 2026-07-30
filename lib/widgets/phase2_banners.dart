import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class WhatsappBotBanner extends StatelessWidget {
  const WhatsappBotBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFDCF8C6).withOpacity(0.5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF25D366).withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: Color(0xFF25D366),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.chat, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAlignment.start,
              children: [
                const Text(
                  'WhatsApp Integration (Phase 2)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF075E54)),
                ),
                Text(
                  'Add items by sending voice notes or messages to your GharSync WhatsApp Bot!',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class PriceEstimatorCard extends StatelessWidget {
  final int itemCount;
  const PriceEstimatorCard({super.key, required this.itemCount});

  @override
  Widget build(BuildContext context) {
    // Rough estimate stub: ~PKR 350 per grocery item
    final estimatedTotal = itemCount * 350;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryDarkEmerald, AppTheme.primaryEmerald],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAlignment.start,
            children: [
              Row(
                children: const [
                  Icon(Icons.calculate_outlined, color: Colors.amber, size: 18),
                  SizedBox(width: 6),
                  Text(
                    'Price Estimator (Phase 2)',
                    style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Est. Total: PKR $estimatedTotal',
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$itemCount items',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}
