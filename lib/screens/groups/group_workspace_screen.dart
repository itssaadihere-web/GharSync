import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../theme/app_theme.dart';
import '../history/history_screen.dart';

class GroupWorkspaceScreen extends ConsumerStatefulWidget {
  final String groupId;
  const GroupWorkspaceScreen({super.key, required this.groupId});

  @override
  ConsumerState<GroupWorkspaceScreen> createState() => _GroupWorkspaceScreenState();
}

class _GroupWorkspaceScreenState extends ConsumerState<GroupWorkspaceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _chatController = TextEditingController();

  final List<Map<String, dynamic>> _messages = [
    {
      'sender': 'Abbu',
      'text': 'Assalam o Alaikum, main market ja raha hoon. Kisi ko kuch mangwana hai?',
      'time': '10:30 AM',
      'type': 'chat'
    },
    {
      'sender': 'Ammi',
      'text': 'Walaikum Assalam. 2 kilo aloo aur 1.5 liter doodh le aao.',
      'time': '10:32 AM',
      'type': 'purchase',
      'extracted': '🛒 Auto-Added: 2 kg Aloo & 1.5 L Doodh'
    },
    {
      'sender': 'Ammi',
      'text': 'Hamza pay electricity bill by 5 PM today.',
      'time': '10:35 AM',
      'type': 'task',
      'extracted': '📋 Auto-Created Task: Pay Electricity Bill (Assigned to Hamza, Due 5:00 PM)'
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _chatController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _chatController.text.trim();
    if (text.isEmpty) return;

    final lower = text.toLowerCase();
    String type = 'chat';
    String? extracted;

    if (lower.contains('bill') || lower.contains('report') || lower.contains('by 5') || lower.contains('task')) {
      type = 'task';
      extracted = '📋 Auto-Created Task: Synced to Google Tasks & Calendar';
    } else if (lower.contains('kilo') || lower.contains('aloo') || lower.contains('doodh') || lower.contains('soap') || lower.contains('chahiye')) {
      type = 'purchase';
      extracted = '🛒 Auto-Added to Group Purchase List';
    }

    setState(() {
      _messages.add({
        'sender': 'You (Ammi)',
        'text': text,
        'time': 'Now',
        'type': type,
        'extracted': extracted,
      });
      _chatController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF075E54),
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/groups'),
        ),
        title: Column(
          crossAxisAlignment: CrossAlignment.start,
          children: const [
            Text('Khan Family Household 🏡', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Text('3 members • 4 pending purchases', style: TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(text: '💬 Chat'),
            Tab(text: '🛒 Purchases'),
            Tab(text: '📋 Tasks'),
            Tab(text: '👥 Members'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // SUB-TAB 1: UNIFIED CHAT FEED WITH AI EXTRACTION BADGES
          Column(
            children: [
              Expanded(
                child: Container(
                  color: const Color(0xFFEFEAE2),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      final isOut = msg['sender'].toString().startsWith('You');

                      return Align(
                        alignment: isOut ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                          decoration: BoxDecoration(
                            color: isOut ? const Color(0xFFDCF8C6) : Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: const Offset(0, 2)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAlignment.start,
                            children: [
                              Text(
                                msg['sender'],
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF075E54)),
                              ),
                              const SizedBox(height: 4),
                              Text(msg['text'], style: const TextStyle(fontSize: 14)),
                              if (msg['extracted'] != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: msg['type'] == 'purchase' ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: msg['type'] == 'purchase' ? AppTheme.primaryEmerald : AppTheme.accentAmber,
                                    ),
                                  ),
                                  child: Text(
                                    msg['extracted'],
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: msg['type'] == 'purchase' ? AppTheme.primaryDarkEmerald : Colors.amber.shade900,
                                    ),
                                  ),
                                ),
                              ],
                              const SizedBox(height: 4),
                              Align(
                                alignment: Alignment.bottomRight,
                                child: Text(msg['time'], style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // Chat Input Bar
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.mic, color: AppTheme.accentAmber),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('🎙️ Voice Note Recording & AI Auto-Transcription Active!')),
                        );
                      },
                    ),
                    Expanded(
                      child: TextField(
                        controller: _chatController,
                        decoration: InputDecoration(
                          hintText: 'Message or voice note...',
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          fillColor: Colors.grey.shade100,
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                    const SizedBox(width: 6),
                    CircleAvatar(
                      backgroundColor: AppTheme.primaryEmerald,
                      child: IconButton(
                        icon: const Icon(Icons.send, color: Colors.white, size: 18),
                        onPressed: _sendMessage,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // SUB-TAB 2: PURCHASES LIST & STORE RUNNER MODE
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.primaryDarkEmerald,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('🛍️ Store Runner Mode', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    Text('Est: PKR 1,400', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const ListTile(
                leading: Text('🥦', style: TextStyle(fontSize: 24)),
                title: Text('Aloo (Potatoes)', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('2 kg • Added by Ammi via Chat'),
                trailing: Icon(Icons.check_circle_outline, color: AppTheme.primaryEmerald),
              ),
              const ListTile(
                leading: Text('🥛', style: TextStyle(fontSize: 24)),
                title: Text('Doodh (Fresh Milk)', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('1.5 liter • Added by Ammi via Chat'),
                trailing: Icon(Icons.check_circle_outline, color: AppTheme.primaryEmerald),
              ),
            ],
          ),

          // SUB-TAB 3: TASKS & GOOGLE CALENDAR SYNC
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.calendar_today, color: Colors.blue),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Google Tasks & Calendar Auto-Sync Active for Assigned Group Tasks.',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.blue),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: ListTile(
                  title: const Text('Pay Electricity Bill', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Assigned to: Hamza • Due: Today, 5:00 PM'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.blue.shade100, borderRadius: BorderRadius.circular(8)),
                    child: const Text('Google Synced', style: TextStyle(fontSize: 10, color: Colors.blue, fontWeight: FontWeight.bold)),
                  ),
                ),
              ),
            ],
          ),

          // SUB-TAB 4: GROUP MEMBERS
          ListView(
            padding: const EdgeInsets.all(16),
            children: const [
              ListTile(
                leading: CircleAvatar(child: Text('A')),
                title: Text('Ammi (Admin)'),
                subtitle: Text('+92 300 1234567'),
              ),
              ListTile(
                leading: CircleAvatar(child: Text('A')),
                title: Text('Abbu (Runner)'),
                subtitle: Text('+92 300 9876543'),
              ),
              ListTile(
                leading: CircleAvatar(child: Text('H')),
                title: Text('Hamza (Member)'),
                subtitle: Text('+92 301 5554433'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
