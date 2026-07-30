import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../theme/app_theme.dart';

class GroupsListScreen extends ConsumerWidget {
  const GroupsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUserName = ref.watch(currentUserNameProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF075E54), // WhatsApp Green
        foregroundColor: Colors.white,
        title: Column(
          crossAxisAlignment: CrossAlignment.start,
          children: [
            const Text('GharSync', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
            Text('👤 $currentUserName', style: const TextStyle(fontSize: 12, color: Colors.white70)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.star, color: Colors.amber),
            onPressed: () => context.push('/paywall'),
          ),
          IconButton(
            icon: const Icon(Icons.group_add_outlined),
            onPressed: () => _showCreateGroupDialog(context),
          ),
        ],
      ),
      body: Column(
        crossAlignment: CrossAlignment.start,
        children: [
          // Search Bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search chats, groups or items...',
                prefixIcon: const Icon(Icons.search, size: 20),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                fillColor: Colors.grey.shade100,
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
            child: Text(
              'YOUR ACTIVE GROUPS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: Colors.grey.shade600,
                letterSpacing: 0.8,
              ),
            ),
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              children: [
                _buildGroupTile(
                  context,
                  groupId: 'g1',
                  avatar: '🏡',
                  name: 'Khan Family Household',
                  lastMsg: 'Ammi: 2 kilo aloo le aao',
                  time: '11:32 AM',
                  unread: 2,
                  memberCount: 3,
                ),
                _buildGroupTile(
                  context,
                  groupId: 'g2',
                  avatar: '💼',
                  name: 'Office Project Team',
                  lastMsg: 'Ali: Submit project report by 5 PM',
                  time: '10:15 AM',
                  unread: 1,
                  memberCount: 4,
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primaryEmerald,
        onPressed: () => _showCreateGroupDialog(context),
        child: const Icon(Icons.chat_bubble_outline, color: Colors.white),
      ),
    );
  }

  Widget _buildGroupTile(
    BuildContext context, {
    required String groupId,
    required String avatar,
    required String name,
    required String lastMsg,
    required String time,
    required int unread,
    required int memberCount,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ListTile,
    );
  }

  void _showCreateGroupDialog(BuildContext context) {
    final nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create New Group'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(hintText: 'e.g. Family Household, Office Team...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              if (nameController.text.isNotEmpty) {
                context.push('/group/g1');
              }
            },
            child: const Text('Create Group'),
          ),
        ],
      ),
    );
  }
}
