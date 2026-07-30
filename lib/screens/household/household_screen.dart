import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../models/member.dart';
import '../../providers/providers.dart';
import '../../theme/app_theme.dart';

class HouseholdScreen extends ConsumerWidget {
  const HouseholdScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final householdId = ref.watch(activeHouseholdIdProvider);
    final householdAsync = ref.watch(activeHouseholdStreamProvider);
    final membersAsync = ref.watch(householdMembersStreamProvider);
    final firestoreService = ref.read(firestoreServiceProvider);

    final familyName = householdAsync.value?.familyName ?? 'Our Family';
    final subscriptionStatus = householdAsync.value?.subscriptionStatus ?? 'free';

    return Scaffold(
      appBar: AppBar(
        title: const Text('👨‍👩‍👧‍👦 Household & Members'),
        actions: [
          IconButton(
            icon: const Icon(Icons.star, color: AppTheme.accentAmber),
            onPressed: () => context.push('/paywall'),
            tooltip: 'Subscription & Features',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Household Header Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        familyName,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: subscriptionStatus == 'premium'
                              ? AppTheme.accentAmber.withOpacity(0.2)
                              : Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          subscriptionStatus.toUpperCase(),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: subscriptionStatus == 'premium'
                                ? AppTheme.accentAmber
                                : Colors.grey.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(Icons.vpn_key_outlined, size: 16, color: AppTheme.textMuted),
                      const SizedBox(width: 6),
                      Text(
                        'Invite ID: ${householdId ?? "N/A"}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      TextButton.icon(
                        onPressed: () {
                          if (householdId != null) {
                            Clipboard.setData(ClipboardData(text: householdId));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Household Invite ID copied to clipboard!')),
                            );
                          }
                        },
                        icon: const Icon(Icons.copy, size: 14),
                        label: const Text('Copy ID'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Upgrade Paywall Stub Banner
          InkWell(
            onTap: () => context.push('/paywall'),
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.accentAmber, Color(0xFFF59E0B)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.workspace_premium, color: Colors.white, size: 36),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'GharSync Premium',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Unlimited members, voice notes & WhatsApp bot ingestion.',
                          style: TextStyle(color: Colors.white90, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 16),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Members List
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Family Members',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(120, 38),
                  backgroundColor: AppTheme.primaryEmerald,
                ),
                onPressed: () => _showAddMemberDialog(context, ref, householdId),
                icon: const Icon(Icons.person_add, size: 16),
                label: const Text('Invite', style: TextStyle(fontSize: 13)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          membersAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Text('Error: $err'),
            data: (members) {
              if (members.isEmpty) {
                return const Card(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('No members found yet. Share your invite ID above!'),
                  ),
                );
              }

              return Column(
                children: members.map((member) {
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: AppTheme.primaryEmerald.withOpacity(0.15),
                        child: Text(
                          member.name.isNotEmpty ? member.name[0].toUpperCase() : 'M',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryEmerald),
                        ),
                      ),
                      title: Text(
                        member.name,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        '${member.phoneNumber.isNotEmpty ? member.phoneNumber : "No phone"} • Role: ${member.role.name}',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      ),
                      trailing: PopupMenuButton<HouseholdRole>(
                        icon: const Icon(Icons.more_vert),
                        onSelected: (newRole) {
                          if (householdId != null) {
                            firestoreService.updateMemberRole(
                              householdId: householdId,
                              userId: member.userId,
                              newRole: newRole,
                            );
                          }
                        },
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: HouseholdRole.admin,
                            child: Text('Set as Admin'),
                          ),
                          const PopupMenuItem(
                            value: HouseholdRole.member,
                            child: Text('Set as Member'),
                          ),
                          const PopupMenuItem(
                            value: HouseholdRole.runner,
                            child: Text('Set as Runner'),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }

  void _showAddMemberDialog(BuildContext context, WidgetRef ref, String? householdId) {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Invite Family Member'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Member Name (e.g. Abbu)'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone Number'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (householdId != null && nameController.text.isNotEmpty) {
                final firestoreService = ref.read(firestoreServiceProvider);
                final newId = 'user_${DateTime.now().millisecondsSinceEpoch}';

                await firestoreService.addMemberToHousehold(
                  householdId: householdId,
                  userId: newId,
                  name: nameController.text.trim(),
                  phoneNumber: phoneController.text.trim(),
                );

                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Invited ${nameController.text} to household!')),
                  );
                }
              }
            },
            child: const Text('Add Member'),
          ),
        ],
      ),
    );
  }
}
