import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/providers.dart';
import '../screens/auth/phone_login_screen.dart';
import '../screens/groups/groups_list_screen.dart';
import '../screens/groups/group_workspace_screen.dart';
import '../screens/paywall/paywall_screen.dart';
import '../screens/splash/splash_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const PhoneLoginScreen(),
      ),
      GoRoute(
        path: '/groups',
        builder: (context, state) => const GroupsListScreen(),
      ),
      GoRoute(
        path: '/group/:groupId',
        builder: (context, state) {
          final groupId = state.pathParameters['groupId'] ?? 'g1';
          return GroupWorkspaceScreen(groupId: groupId);
        },
      ),
      GoRoute(
        path: '/paywall',
        builder: (context, state) => const PaywallScreen(),
      ),
    ],
  );
});
