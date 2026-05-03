import 'package:flutter/material.dart';

import 'screens/home_screen.dart';
import 'services/api_service.dart';
import 'utils/helpers.dart';

/// Starts the GiftNest Flutter application.
void main() {
  runApp(const GiftNestApp());
}

/// Root widget that owns the shared gift plan controller and app theme.
class GiftNestApp extends StatefulWidget {
  /// Creates the application shell.
  const GiftNestApp({super.key});

  @override
  State<GiftNestApp> createState() => _GiftNestAppState();
}

/// Backward-compatible app entry widget for older tests and imports.
class MyApp extends GiftNestApp {
  /// Creates the app using the previous default widget name.
  const MyApp({super.key});
}

/// State for [GiftNestApp] that disposes the app-wide controller.
class _GiftNestAppState extends State<GiftNestApp> {
  /// Controller shared by all gift planning screens.
  late final GiftPlanController controller = GiftPlanController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gift love',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: cream,
        colorScheme: ColorScheme.fromSeed(seedColor: coral),
        textTheme: Theme.of(
          context,
        ).textTheme.apply(bodyColor: ink, displayColor: ink),
      ),
      home: StartPage(controller: controller),
    );
  }
}
