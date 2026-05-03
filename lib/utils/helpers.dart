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
  return slotRange(slot)?.start ?? 2400;
}

/// Time range in minutes after midnight.
class SlotRange {
  /// Creates a parsed time range.
  const SlotRange({required this.start, required this.end});

  /// Range start in minutes after midnight.
  final int start;

  /// Range end in minutes after midnight.
  final int end;

  /// Whether this range overlaps another range.
  bool overlaps(SlotRange other) {
    return start < other.end && other.start < end;
  }
}

/// Parses a slot label into a comparable time range.
SlotRange? slotRange(String slot) {
  final parts = slot.split('-');
  final startLabel = parts.first.trim();
  final endLabel = parts.length > 1 ? parts.sublist(1).join('-').trim() : null;
  final endMeridiem = _meridiemIn(endLabel);
  final start = _parseTime(startLabel, fallbackMeridiem: endMeridiem);

  if (start == null) return null;

  final end = endLabel == null
      ? start + 60
      : _parseTime(endLabel, fallbackMeridiem: _meridiemIn(startLabel));

  if (end == null) return SlotRange(start: start, end: start + 60);

  return SlotRange(start: start, end: end <= start ? end + 1440 : end);
}

/// Returns true when two slot labels overlap.
bool slotsOverlap(String first, String second) {
  final firstRange = slotRange(first);
  final secondRange = slotRange(second);

  if (firstRange == null || secondRange == null) return first == second;

  return firstRange.overlaps(secondRange);
}

String? _meridiemIn(String? value) {
  if (value == null) return null;
  return RegExp(r'\b(AM|PM)\b').firstMatch(value)?.group(1);
}

int? _parseTime(String value, {String? fallbackMeridiem}) {
  final match = RegExp(r'(\d{1,2}):(\d{2})?\s*(AM|PM)?').firstMatch(value);
  if (match == null) return null;

  var hour = int.parse(match.group(1)!);
  final minute = int.tryParse(match.group(2) ?? '0') ?? 0;
  final meridiem = match.group(3) ?? fallbackMeridiem;

  if (meridiem == 'PM' && hour != 12) hour += 12;
  if (meridiem == 'AM' && hour == 12) hour = 0;

  return hour * 60 + minute;
}
