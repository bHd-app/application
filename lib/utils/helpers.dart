import 'package:flutter/material.dart';

/// Primary near-black brand color.
const ink = Color(0xFF111827);

/// App background color.
const cream = Color(0xFFF6F7FB);

/// Elevated card surface color.
const paper = Color(0xFFFFFFFF);

/// Muted body text color.
const mutedInk = Color(0xFF667085);

/// Hairline border color for cards and inputs.
const line = Color(0xFFE4E7EC);

/// Primary call-to-action accent color.
const coral = Color(0xFFF15A46);

/// Secondary warm accent color.
const gold = Color(0xFFF2B94B);

/// Secondary cool accent color.
const violet = Color(0xFF6F5EF7);

/// Calm green accent used for positive and premium surfaces.
const mint = Color(0xFF0E9F6E);

/// Clear blue accent used for informational highlights.
const sky = Color(0xFF2F80ED);

/// Builds the standard app bar used by secondary screens.
AppBar appBar(BuildContext context, String title) {
  return AppBar(
    title: Text(title),
    centerTitle: false,
    backgroundColor: cream,
    surfaceTintColor: Colors.transparent,
    elevation: 0,
    scrolledUnderElevation: 0,
    titleTextStyle: Theme.of(
      context,
    ).textTheme.titleLarge?.copyWith(color: ink, fontWeight: FontWeight.w900),
    iconTheme: const IconThemeData(color: ink),
  );
}

/// Builds the shared white panel decoration used by cards and sections.
BoxDecoration panelDecoration() {
  return BoxDecoration(
    color: paper,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: line),
    boxShadow: [
      BoxShadow(
        color: ink.withValues(alpha: 0.06),
        blurRadius: 24,
        offset: const Offset(0, 12),
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
