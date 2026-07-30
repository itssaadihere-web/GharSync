# 🏡 GharSync Mobile App

A cross-platform mobile app built with **Flutter** and **Firebase** (Firestore + Auth + Cloud Functions + Cloud Messaging) for shared household grocery and errand list management.

---

## 🚀 Key Features

1. **Phone Auth & Household Setup**: OTP phone sign-in with instant family household creation and member invite links.
2. **Shared Household Checklist**: Real-time synced checklist powered by Firestore snapshot streams (`households/{householdId}/listItems`).
3. **AI Item Parsing & Categorization**:
   - Cloud Function (`parseListItem`) invoking Gemini LLM for structured JSON output (`itemName`, `quantity`, `unit`, `category`).
   - Resilient client-side Dart **Rule-Based Fallback Parser** supporting English and Roman Urdu inputs (e.g. `"2 kilo aloo"`, `"1/2 dozen eggs"`, `"pao tamatar"`, `"dettol soap"`).
4. **Runner Shopping Mode**: Distraction-free, large-tap-target interface grouped by store aisle (Vegetables, Dairy, Toiletries, Medical, Grocery, Other) with 1-tap "bought" status sync.
5. **Push Notifications**: Firebase Cloud Messaging (FCM) triggers when items are added or marked bought.
6. **30-Day History**: Past purchases log per household with 1-tap re-add functionality.
7. **Phase 2 Stubs**: Voice note recording UI stub, WhatsApp Bot webhook integration banner, and Free vs Premium Paywall screen.

---

## 📁 Directory Structure

```
GharSync/
├── lib/
│   ├── main.dart
│   ├── theme/
│   │   └── app_theme.dart
│   ├── models/
│   │   ├── household.dart
│   │   ├── member.dart
│   │   └── list_item.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── firestore_service.dart
│   │   ├── ai_parser_service.dart
│   │   ├── rule_based_parser.dart
│   │   └── fcm_service.dart
│   ├── providers/
│   │   └── providers.dart
│   ├── routing/
│   │   └── app_router.dart
│   ├── screens/
│   │   ├── auth/phone_login_screen.dart
│   │   ├── home/home_screen.dart
│   │   ├── shopping/shopping_mode_screen.dart
│   │   ├── history/history_screen.dart
│   │   ├── household/household_screen.dart
│   │   └── paywall/paywall_screen.dart
│   └── widgets/
│       ├── add_item_sheet.dart
│       ├── item_tile.dart
│       └── phase2_banners.dart
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── pubspec.yaml
```

---

## 🛠️ Deploying Cloud Functions & Rules

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Initialize and deploy rules/functions:
   ```bash
   firebase login
   firebase use --add <your-firebase-project-id>
   firebase deploy --only firestore:rules,firestore:indexes
   cd functions && npm install && npm run build
   firebase deploy --only functions
   ```
3. Set Gemini API Key in Cloud Functions (Optional):
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
