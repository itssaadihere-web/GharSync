import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'routing/app_router.dart';
import 'services/fcm_service.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp();
    await FcmService().initialize();
  } catch (e) {
    debugPrint('Firebase initial setup note: $e');
  }

  runApp(
    const ProviderScope(
      child: GharSyncApp(),
    ),
  );
}

class GharSyncApp extends ConsumerWidget {
  const GharSyncApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'GharSync - Household Grocery App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }
}
