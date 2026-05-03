import 'package:flutter/material.dart';

/// Primary near-black brand color.
const ink = Color(0xFF161214);

/// Warm app background color.
const cream = Color(0xFFFFF5EA);

/// Primary call-to-action accent color.
const coral = Color(0xFFFF5A4F);

/// Secondary warm accent color.
const gold = Color(0xFFFFC05A);

/// Secondary cool accent color.
const violet = Color(0xFF7C5CFF);

/// Builds the standard app bar used by secondary screens.
AppBar appBar(BuildContext context, String title) {
  return AppBar(
    title: Text(title),
    centerTitle: false,
    backgroundColor: cream,
    surfaceTintColor: cream,
  );
}

/// Builds the shared white panel decoration used by cards and sections.
BoxDecoration panelDecoration() {
  return BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(22),
    border: Border.all(color: const Color(0xFFE9D9CA)),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withValues(alpha: 0.04),
        blurRadius: 16,
        offset: const Offset(0, 8),
      ),
    ],
  );
}

/// Pushes a new material route onto the current navigator.
void push(BuildContext context, Widget page) {
  Navigator.push(context, MaterialPageRoute(builder: (_) => page));
}

/// Formats a date as a readable month-day-year label.
String formatDate(DateTime date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${months[date.month - 1]} ${date.day}, ${date.year}';
}

/// Formats a date as a compact numeric label.
String shortDate(DateTime date) {
  return '${date.month}/${date.day}/${date.year.toString().substring(2)}';
}

/// Converts a time slot label into sortable minutes after midnight.
int slotSortValue(String slot) {
  final match = RegExp(r'(\d{1,2}):(\d{2})?\s*(AM|PM)?').firstMatch(slot);
  if (match == null) return 2400;

  var hour = int.parse(match.group(1)!);
  final minute = int.tryParse(match.group(2) ?? '0') ?? 0;
  final meridiem = match.group(3);

  if (meridiem == 'PM' && hour != 12) hour += 12;
  if (meridiem == 'AM' && hour == 12) hour = 0;

  return hour * 60 + minute;
}
