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
      title: 'Expergift',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: cream,
        colorScheme: const ColorScheme.light(
          primary: ink,
          onPrimary: Colors.white,
          secondary: coral,
          onSecondary: Colors.white,
          tertiary: mint,
          surface: paper,
          onSurface: ink,
          error: Color(0xFFE5484D),
        ),
        appBarTheme: const AppBarTheme(backgroundColor: cream),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: ink,
            foregroundColor: Colors.white,
            disabledBackgroundColor: line,
            disabledForegroundColor: mutedInk,
            minimumSize: const Size(64, 52),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            textStyle: const TextStyle(fontWeight: FontWeight.w800),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: ink,
            side: const BorderSide(color: line),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            textStyle: const TextStyle(fontWeight: FontWeight.w800),
          ),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: paper,
          selectedColor: ink,
          checkmarkColor: Colors.white,
          labelStyle: const TextStyle(color: ink, fontWeight: FontWeight.w700),
          secondaryLabelStyle: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
          ),
          side: const BorderSide(color: line),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFF9FAFB),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: line),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: line),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: ink, width: 1.4),
          ),
          labelStyle: const TextStyle(color: mutedInk),
          prefixIconColor: mutedInk,
        ),
        snackBarTheme: SnackBarThemeData(
          behavior: SnackBarBehavior.floating,
          backgroundColor: ink,
          contentTextStyle: const TextStyle(color: Colors.white),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        textTheme: Theme.of(
          context,
        ).textTheme.apply(bodyColor: ink, displayColor: ink),
      ),
      home: StartPage(controller: controller),
    );
  }
}
