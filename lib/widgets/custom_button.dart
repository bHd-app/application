import 'package:flutter/material.dart';

import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/helpers.dart';

/// Brand lockup used at the top of the start screen.
class BrandHeader extends StatelessWidget {
  /// Creates the brand header.
  const BrandHeader({super.key, this.onDark = false});

  /// Whether the header is displayed on a dark background.
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final color = onDark ? Colors.white : ink;
    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: onDark ? Colors.white.withValues(alpha: 0.14) : ink,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(
            Icons.card_giftcard,
            color: onDark ? Colors.white : cream,
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Topol Gift',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: color,
                fontWeight: FontWeight.w900,
              ),
            ),
            Text(
              'Experience cards',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: color.withValues(alpha: 0.62),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Large tappable card used on the start screen.
class StartActionCard extends StatelessWidget {
  /// Creates a start screen action card.
  const StartActionCard({
    super.key,
    required this.number,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  /// Step number shown in the card badge.
  final String number;

  /// Primary action title.
  final String title;

  /// Supporting text that explains the action.
  final String description;

  /// Icon shown inside the colored badge.
  final IconData icon;

  /// Badge color.
  final Color color;

  /// Callback invoked when the card is tapped.
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withValues(alpha: 0.14)),
          ),
          child: Row(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Icon(icon, color: ink, size: 26),
                    Positioned(
                      top: 5,
                      right: 7,
                      child: Text(
                        number,
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: ink,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.68),
                        height: 1.25,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward_ios,
                color: Colors.white,
                size: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Form panel where users set gift date, recipient, and card note.
class GiftSetupPanel extends StatefulWidget {
  /// Creates the gift setup panel.
  const GiftSetupPanel({super.key, required this.controller});

  /// Controller updated by the form fields.
  final GiftPlanController controller;

  @override
  State<GiftSetupPanel> createState() => _GiftSetupPanelState();
}

/// State for the gift setup form text controllers and date picker.
class _GiftSetupPanelState extends State<GiftSetupPanel> {
  /// Text controller for the recipient field.
  late final TextEditingController recipientController;

  /// Text controller for the card note field.
  late final TextEditingController noteController;

  @override
  void initState() {
    super.initState();
    recipientController = TextEditingController(
      text: widget.controller.recipient,
    );
    noteController = TextEditingController(text: widget.controller.note);
  }

  @override
  void dispose() {
    recipientController.dispose();
    noteController.dispose();
    super.dispose();
  }

  /// Opens the platform date picker and stores the selected date.
  Future<void> pickDate() async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDate: widget.controller.date,
    );

    if (picked != null) {
      widget.controller.updateDate(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: panelDecoration(),
      child: Column(
        children: [
          InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: pickDate,
            child: Ink(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: gold.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.event_available, color: coral),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Gift date: ${formatDate(widget.controller.date)}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  const Icon(Icons.edit_calendar),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: recipientController,
            onChanged: widget.controller.updateRecipient,
            decoration: const InputDecoration(
              labelText: 'Recipient',
              prefixIcon: Icon(Icons.person),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: noteController,
            onChanged: widget.controller.updateNote,
            minLines: 2,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Note on card',
              prefixIcon: Icon(Icons.notes),
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
    );
  }
}

/// Summary panel that shows stop count, total cost, and date.
class CostPulse extends StatelessWidget {
  /// Creates a cost summary panel.
  const CostPulse({super.key, required this.controller});

  /// Controller that provides gift count, total, and date.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: [ink, Color(0xFF2E1A3E), violet],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${controller.gifts.length} stops planned',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Colors.white.withValues(alpha: 0.72),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '\$${controller.total}',
                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Text(
              shortDate(controller.date),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Tappable category tile in the builder menu grid.
class CategoryButton extends StatelessWidget {
  /// Creates a category tile.
  const CategoryButton({
    super.key,
    required this.category,
    required this.onTap,
  });

  /// Category displayed by this tile.
  final GiftCategory category;

  /// Callback invoked when the tile is tapped.
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: category.color.withValues(alpha: 0.26)),
            boxShadow: [
              BoxShadow(
                color: category.color.withValues(alpha: 0.12),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: category.color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Icon(category.icon, color: category.color),
              ),
              const Spacer(),
              Text(
                category.name,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 2),
              Text(
                category.subtitle,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.black.withValues(alpha: 0.55),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Place card that lets users choose a time slot and add a planned gift.
class PlaceSelectionCard extends StatefulWidget {
  /// Creates a selectable place card.
  const PlaceSelectionCard({
    super.key,
    required this.controller,
    required this.category,
    required this.subcategory,
    required this.place,
  });

  /// Controller that receives the selected planned gift.
  final GiftPlanController controller;

  /// Parent category for the place.
  final GiftCategory category;

  /// Parent subcategory for the place.
  final GiftSubcategory subcategory;

  /// Place displayed by this card.
  final GiftPlace place;

  @override
  State<PlaceSelectionCard> createState() => _PlaceSelectionCardState();
}

/// State for the selected time slot in [PlaceSelectionCard].
class _PlaceSelectionCardState extends State<PlaceSelectionCard> {
  /// Currently selected slot for this place.
  late String selectedSlot;

  @override
  void initState() {
    super.initState();
    selectedSlot = widget.place.slots.first;
  }

  @override
  void didUpdateWidget(covariant PlaceSelectionCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.place != widget.place) {
      selectedSlot = widget.place.slots.first;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.place.name,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      widget.place.description,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.black.withValues(alpha: 0.58),
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${widget.place.price}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: widget.category.color,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    '${widget.place.rating} star',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: widget.place.slots.map((slot) {
              return ChoiceChip(
                label: Text(slot),
                selected: selectedSlot == slot,
                onSelected: (_) => setState(() => selectedSlot = slot),
              );
            }).toList(),
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () {
                widget.controller.addGift(
                  PlannedGift(
                    category: widget.category.name,
                    subcategory: widget.subcategory.name,
                    place: widget.place,
                    slot: selectedSlot,
                    icon: widget.category.icon,
                    color: widget.category.color,
                  ),
                );
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      '${widget.place.name} added for $selectedSlot',
                    ),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
                Navigator.pop(context);
              },
              icon: const Icon(Icons.add_circle),
              label: const Text('Add and return to menu'),
            ),
          ),
        ],
      ),
    );
  }
}

/// Timeline that renders each selected gift in chronological order.
class DayTimeline extends StatelessWidget {
  /// Creates the planned day timeline.
  const DayTimeline({super.key, required this.gifts, required this.onRemove});

  /// Gifts shown in the timeline.
  final List<PlannedGift> gifts;

  /// Callback invoked when a gift is removed.
  final ValueChanged<PlannedGift> onRemove;

  @override
  Widget build(BuildContext context) {
    if (gifts.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: panelDecoration(),
        child: Text(
          'Your day is empty. Pick a category or start from a ready package.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Colors.black.withValues(alpha: 0.58),
          ),
        ),
      );
    }

    return Column(
      children: gifts.map((gift) {
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: panelDecoration(),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: gift.color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(gift.icon, color: gift.color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      gift.slot,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: gift.color,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      gift.place.name,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      '${gift.category} / ${gift.subcategory}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.black.withValues(alpha: 0.54),
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '\$${gift.place.price}',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
              ),
              IconButton(
                onPressed: () => onRemove(gift),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

/// Visual preview of the generated gift card.
class CreditGiftCard extends StatelessWidget {
  /// Creates the generated gift card preview.
  const CreditGiftCard({super.key, required this.controller});

  /// Controller that provides recipient, note, date, and total value.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    final recipient = controller.recipient.trim().isEmpty
        ? 'Someone special'
        : controller.recipient.trim();
    final note = controller.note.trim().isEmpty
        ? 'A full day of gifts, planned with care.'
        : controller.note.trim();

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: const LinearGradient(
          colors: [Color(0xFF111113), Color(0xFF3A1C52), Color(0xFFFF5A4F)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: coral.withValues(alpha: 0.28),
            blurRadius: 26,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'GIFTNEST WORLD',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: Colors.white.withValues(alpha: 0.72),
                  fontWeight: FontWeight.w900,
                ),
              ),
              const Spacer(),
              const CardCircles(),
              const SizedBox(width: 18),
            ],
          ),
          const SizedBox(height: 30),
          Text(
            '\$${controller.total}',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'FOR $recipient',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            note,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.78),
              height: 1.35,
            ),
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              Expanded(
                child: CardMeta(
                  label: 'DATE',
                  value: shortDate(controller.date),
                ),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: CardMeta(label: 'CARD', value: '5482 0917 4421'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Decorative overlapping circles shown on the generated card.
class CardCircles extends StatelessWidget {
  /// Creates the card circle decoration.
  const CardCircles({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: gold.withValues(alpha: 0.92),
            shape: BoxShape.circle,
          ),
        ),
        Positioned(
          left: 22,
          child: Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.38),
              shape: BoxShape.circle,
            ),
          ),
        ),
      ],
    );
  }
}

/// Label-value pair used in the generated card metadata area.
class CardMeta extends StatelessWidget {
  /// Creates a card metadata item.
  const CardMeta({super.key, required this.label, required this.value});

  /// Small uppercase label.
  final String label;

  /// Metadata value.
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Colors.white.withValues(alpha: 0.55),
            fontWeight: FontWeight.w800,
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}
