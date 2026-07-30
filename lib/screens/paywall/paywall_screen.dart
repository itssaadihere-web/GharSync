import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/providers.dart';
import '../../theme/app_theme.dart';

class PaywallScreen extends ConsumerWidget {
  const PaywallScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🌟 GharSync Premium'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Top Hero Illustration Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primaryDarkEmerald, AppTheme.primaryEmerald],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: const [
                  Text('👑', style: TextStyle(fontSize: 54)),
                  SizedBox(height: 12),
                  Text(
                    'Upgrade Your Family Household',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Simplify grocery management for everyone at home.',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Tier Comparison Table
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildFeatureRow('Household Members', 'Up to 3', 'Unlimited ♾️', isHighlight: true),
                    const Divider(),
                    _buildFeatureRow('Real-time List Sync', '✓ Included', '✓ Included'),
                    const Divider(),
                    _buildFeatureRow('AI Item Categorization', 'Rule-Based', 'Gemini LLM 🤖'),
                    const Divider(),
                    _buildFeatureRow('Voice Note Input', '🔒 Phase 2 Stub', '✓ Included 🎙️'),
                    const Divider(),
                    _buildFeatureRow('WhatsApp Bot Integration', '🔒 Phase 2 Stub', '✓ Included 💬'),
                    const Divider(),
                    _buildFeatureRow('Push Notifications', 'Basic', 'Instant FCM 🔔'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Subscription Plan Selection
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.accentAmber.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.accentAmber, width: 2),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Family Yearly Pass',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'PKR 1,499 / year (~\$4.99/yr)',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.accentAmber,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      'SAVE 50%',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('🎉 Phase 2 Subscription Paywall Scaffolded! Payments ready to wire.'),
                  ),
                );
              },
              child: const Text('Start 7-Day Free Trial'),
            ),
            const SizedBox(height: 12),
            Text(
              'No commitment. Cancel anytime from App Store / Google Play.',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureRow(String feature, String freeVal, String premiumVal, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              feature,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              freeVal,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            child: Text(
              premiumVal,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryEmerald,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}
