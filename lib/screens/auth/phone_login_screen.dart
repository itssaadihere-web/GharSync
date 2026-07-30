import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../theme/app_theme.dart';

class PhoneLoginScreen extends ConsumerStatefulWidget {
  const PhoneLoginScreen({super.key});

  @override
  ConsumerState<PhoneLoginScreen> createState() => _PhoneLoginScreenState();
}

class _PhoneLoginScreenState extends ConsumerState<PhoneLoginScreen> {
  final TextEditingController _nameController = TextEditingController(text: 'Ammi');
  final TextEditingController _phoneController = TextEditingController(text: '+92 300 1234567');
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _familyController = TextEditingController(text: 'Khan Family');
  final TextEditingController _inviteIdController = TextEditingController();

  bool _codeSent = false;
  String? _verificationId;
  bool _isLoading = false;
  bool _isCreatingHousehold = true;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    _familyController.dispose();
    _inviteIdController.dispose();
    super.dispose();
  }

  Future<void> _sendOTP() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    final authService = ref.read(authServiceProvider);

    try {
      await authService.verifyPhoneNumber(
        phoneNumber: phone,
        verificationCompleted: (credential) async {
          await authService.signInWithCredential(credential);
          _completeLogin();
        },
        verificationFailed: (ex) {
          setState(() {
            _isLoading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Phone verification error: ${ex.message}')),
          );
        },
        codeSent: (verificationId, resendToken) {
          setState(() {
            _verificationId = verificationId;
            _codeSent = true;
            _isLoading = false;
          });
        },
        codeAutoRetrievalTimeout: (verificationId) {
          _verificationId = verificationId;
        },
      );
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _verifyOTP() async {
    final smsCode = _otpController.text.trim();
    if (smsCode.isEmpty || _verificationId == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final authService = ref.read(authServiceProvider);
      await authService.signInWithOTP(
        verificationId: _verificationId!,
        smsCode: smsCode,
      );
      await _completeLogin();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Invalid OTP code. Try again.')),
      );
    }
  }

  Future<void> _demoLogin() async {
    setState(() {
      _isLoading = true;
    });

    final authService = ref.read(authServiceProvider);
    await authService.signInDemoUser(
      name: _nameController.text.trim(),
      phone: _phoneController.text.trim(),
    );

    await _completeLogin();
  }

  Future<void> _completeLogin() async {
    final user = ref.read(authServiceProvider).currentUser;
    final userId = user?.uid ?? 'demo_${DateTime.now().millisecondsSinceEpoch}';
    final name = _nameController.text.trim().isNotEmpty ? _nameController.text.trim() : 'Family Member';
    final phone = _phoneController.text.trim();

    ref.read(currentUserNameProvider.notifier).state = name;
    ref.read(currentUserPhoneProvider.notifier).state = phone;

    final firestoreService = ref.read(firestoreServiceProvider);

    if (_isCreatingHousehold) {
      final familyName = _familyController.text.trim().isNotEmpty
          ? _familyController.text.trim()
          : '$name\'s Household';

      final household = await firestoreService.createHousehold(
        familyName: familyName,
        creatorUserId: userId,
        creatorName: name,
        creatorPhone: phone,
      );

      ref.read(activeHouseholdIdProvider.notifier).state = household.householdId;
    } else {
      final targetId = _inviteIdController.text.trim();
      if (targetId.isNotEmpty) {
        await firestoreService.addMemberToHousehold(
          householdId: targetId,
          userId: userId,
          name: name,
          phoneNumber: phone,
        );
        ref.read(activeHouseholdIdProvider.notifier).state = targetId;
      } else {
        // Fallback create
        final household = await firestoreService.createHousehold(
          familyName: '$name\'s Household',
          creatorUserId: userId,
          creatorName: name,
          creatorPhone: phone,
        );
        ref.read(activeHouseholdIdProvider.notifier).state = household.householdId;
      }
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              // App Brand Header
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.primaryDarkEmerald, AppTheme.primaryEmerald],
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryEmerald.withOpacity(0.3),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          '🏡',
                          style: TextStyle(fontSize: 42),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'GharSync',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                            fontSize: 32,
                            color: AppTheme.primaryDarkEmerald,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'One Shared Grocery List for the Entire Family',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 40),

              // Step 1: User Profile & Setup Mode
              Text(
                'Enter Your Details',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),

              TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Your Name (e.g. Ammi, Abbu, Sara)',
                  prefixIcon: Icon(Icons.person_outline, color: AppTheme.primaryEmerald),
                ),
              ),
              const SizedBox(height: 14),

              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Mobile Phone Number',
                  prefixIcon: Icon(Icons.phone_outlined, color: AppTheme.primaryEmerald),
                ),
              ),
              const SizedBox(height: 20),

              // Household Action Switcher
              Row(
                children: [
                  Expanded(
                    child: ChoiceChip(
                      label: const Text('Create New Household'),
                      selected: _isCreatingHousehold,
                      onSelected: (val) {
                        setState(() => _isCreatingHousehold = true);
                      },
                      selectedColor: AppTheme.primaryEmerald.withOpacity(0.15),
                      labelStyle: TextStyle(
                        color: _isCreatingHousehold ? AppTheme.primaryEmerald : Colors.grey.shade700,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ChoiceChip(
                      label: const Text('Join via Invite ID'),
                      selected: !_isCreatingHousehold,
                      onSelected: (val) {
                        setState(() => _isCreatingHousehold = false);
                      },
                      selectedColor: AppTheme.primaryEmerald.withOpacity(0.15),
                      labelStyle: TextStyle(
                        color: !_isCreatingHousehold ? AppTheme.primaryEmerald : Colors.grey.shade700,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              if (_isCreatingHousehold)
                TextField(
                  controller: _familyController,
                  decoration: const InputDecoration(
                    labelText: 'Household / Family Name',
                    prefixIcon: Icon(Icons.home_outlined, color: AppTheme.primaryEmerald),
                  ),
                )
              else
                TextField(
                  controller: _inviteIdController,
                  decoration: const InputDecoration(
                    labelText: 'Paste Household Invite Code',
                    prefixIcon: Icon(Icons.qr_code_outlined, color: AppTheme.primaryEmerald),
                  ),
                ),

              const SizedBox(height: 24),

              // OTP Section or Demo Login
              if (_codeSent) ...[
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  decoration: const InputDecoration(
                    labelText: '6-Digit SMS OTP Code',
                    prefixIcon: Icon(Icons.lock_clock_outlined, color: AppTheme.primaryEmerald),
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _isLoading ? null : _verifyOTP,
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Verify OTP & Enter App'),
                ),
              ] else ...[
                ElevatedButton(
                  onPressed: _isLoading ? null : _sendOTP,
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Send SMS OTP Verification'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: _isLoading ? null : _demoLogin,
                  child: const Text('⚡ Quick Demo Mode (Instant Sign In)'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
