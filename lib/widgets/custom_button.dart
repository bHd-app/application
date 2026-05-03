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

/// Visual card for one ready package cover.
class ReadyPackageCard extends StatelessWidget {
  /// Creates a ready package card.
  const ReadyPackageCard({
    super.key,
    required this.controller,
    required this.package,
    required this.onTap,
  });

  /// Controller used to resolve package item details.
  final GiftPlanController controller;

  /// Package displayed by the card.
  final ReadyPackage package;

  /// Opens the package detail screen.
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gifts = package.items
        .map(controller.apiService.packageItemToGift)
        .whereType<PlannedGift>()
        .toList();
    final total = gifts.fold<int>(0, (sum, gift) => sum + gift.place.price);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(26),
        onTap: onTap,
        child: Ink(
          height: 238,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(26),
            boxShadow: [
              BoxShadow(
                color: package.themeColor.withValues(alpha: 0.24),
                blurRadius: 22,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(26),
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(package.imageAsset, fit: BoxFit.cover),
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.black.withValues(alpha: 0.64),
                        Colors.black.withValues(alpha: 0.08),
                        package.themeColor.withValues(alpha: 0.72),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              package.name,
                              style: Theme.of(context).textTheme.headlineSmall
                                  ?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                  ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 7,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Text(
                              '\$$total',
                              style: Theme.of(context).textTheme.titleMedium
                                  ?.copyWith(
                                    color: ink,
                                    fontWeight: FontWeight.w900,
                                  ),
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Text(
                        package.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              height: 1.18,
                            ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Icon(
                            Icons.route,
                            color: Colors.white.withValues(alpha: 0.82),
                            size: 18,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${gifts.length} planned stops',
                            style: Theme.of(context).textTheme.labelLarge
                                ?.copyWith(
                                  color: Colors.white.withValues(alpha: 0.82),
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                          const Spacer(),
                          const Icon(Icons.arrow_forward, color: Colors.white),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
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
                final error = widget.controller.addGift(
                  PlannedGift(
                    category: widget.category.name,
                    subcategory: widget.subcategory.name,
                    place: widget.place,
                    slot: selectedSlot,
                    icon: widget.category.icon,
                    color: widget.category.color,
                  ),
                );
                if (error != null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(error),
                      behavior: SnackBarBehavior.floating,
                    ),
                  );
                  return;
                }
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
  const DayTimeline({super.key, required this.gifts, this.onRemove});

  /// Gifts shown in the timeline.
  final List<PlannedGift> gifts;

  /// Callback invoked when a gift is removed.
  final ValueChanged<PlannedGift>? onRemove;

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
              if (onRemove != null)
                IconButton(
                  onPressed: () => onRemove!(gift),
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
  /// Creates a generated gift card preview from the builder state.
  CreditGiftCard.fromController({
    super.key,
    required GiftPlanController controller,
  }) : recipient = controller.recipient,
       note = controller.note,
       date = controller.date,
       total = controller.total,
       cardNumber = '5482 0917 4421',
       status = GiftCardStatus.draft;

  /// Creates a generated gift card preview from a saved card.
  CreditGiftCard.fromPlan({super.key, required GiftCardPlan card})
    : recipient = card.recipient,
      note = card.note,
      date = card.date,
      total = card.total,
      cardNumber = card.cardNumber ?? '5482 0917 4421',
      status = card.status;

  /// Recipient shown on the card.
  final String recipient;

  /// Personal note shown on the card.
  final String note;

  /// Scheduled gift date.
  final DateTime date;

  /// Total card value.
  final int total;

  /// Display card number.
  final String cardNumber;

  /// Draft or purchased state.
  final GiftCardStatus status;

  @override
  Widget build(BuildContext context) {
    final displayRecipient = recipient.trim().isEmpty
        ? 'Someone special'
        : recipient.trim();
    final displayNote = note.trim().isEmpty
        ? 'A full day of gifts, planned with care.'
        : note.trim();

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
            '\$$total',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'FOR $displayRecipient',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            displayNote,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.78),
              height: 1.35,
            ),
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              Expanded(
                child: CardMeta(label: 'DATE', value: shortDate(date)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: CardMeta(
                  label: status == GiftCardStatus.purchased ? 'ISSUED' : 'CARD',
                  value: cardNumber,
                ),
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

/// Loading panel shown during the mock purchase flow.
class PurchaseProcessingPanel extends StatelessWidget {
  /// Creates a mock purchase progress panel.
  const PurchaseProcessingPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      key: const ValueKey('processing-panel'),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          colors: [Color(0xFF0A4CFF), Color(0xFFFF4FA3)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          const SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              'Processing your gift card...',
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

/// Success panel shown after a mock purchase is completed.
class PurchaseCelebration extends StatelessWidget {
  /// Creates a purchase celebration panel.
  const PurchaseCelebration({super.key, required this.plan});

  /// Purchased card snapshot.
  final GiftCardPlan plan;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        gradient: const LinearGradient(
          colors: [Color(0xFF0A4CFF), Color(0xFF8F3DFF), Color(0xFFFF4FA3)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFF4FA3).withValues(alpha: 0.24),
            blurRadius: 22,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.celebration, color: Colors.white),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Purchase completed successfully',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    height: 1.12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            'Your generated file is ready: topol-gift-${plan.id}.pdf',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.78),
            ),
          ),
          const SizedBox(height: 16),
          GiftItineraryTable(gifts: plan.gifts, onDark: true),
          const SizedBox(height: 14),
          FilledButton.icon(
            onPressed: () => _showEmailPreview(context, plan),
            icon: const Icon(Icons.mail),
            label: const Text('Email generated file'),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: ink,
            ),
          ),
        ],
      ),
    );
  }

  void _showEmailPreview(BuildContext context, GiftCardPlan plan) {
    final recipient = plan.recipient.trim().isEmpty
        ? 'Someone special'
        : plan.recipient.trim();
    showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Email preview'),
          content: Text(
            'Subject: Your Topol Gift card is ready\n\n'
            'Hi $recipient,\n\n'
            'Your experience gift card has been purchased successfully. '
            'The attached file includes the gift card, the personal note, '
            'and the full table of where to be at each time.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }
}

/// Compact itinerary table used by cards and purchase success.
class GiftItineraryTable extends StatelessWidget {
  /// Creates an itinerary table.
  const GiftItineraryTable({
    super.key,
    required this.gifts,
    this.onDark = false,
  });

  /// Gifts rendered as itinerary rows.
  final List<PlannedGift> gifts;

  /// Whether the table sits on a dark background.
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final background = onDark
        ? Colors.white.withValues(alpha: 0.12)
        : Colors.white;
    final borderColor = onDark
        ? Colors.white.withValues(alpha: 0.14)
        : const Color(0xFFE9D9CA);
    final primary = onDark ? Colors.white : ink;
    final secondary = onDark
        ? Colors.white.withValues(alpha: 0.72)
        : Colors.black.withValues(alpha: 0.58);

    if (gifts.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: borderColor),
        ),
        child: Text(
          'No stops have been added yet.',
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(color: secondary),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          _ItineraryRow(
            time: 'Time',
            place: 'Place',
            detail: 'Experience',
            primary: primary,
            secondary: secondary,
            isHeader: true,
          ),
          ...gifts.map(
            (gift) => _ItineraryRow(
              time: gift.slot,
              place: gift.place.name,
              detail: '${gift.category} at ${gift.subcategory}',
              primary: primary,
              secondary: secondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ItineraryRow extends StatelessWidget {
  const _ItineraryRow({
    required this.time,
    required this.place,
    required this.detail,
    required this.primary,
    required this.secondary,
    this.isHeader = false,
  });

  final String time;
  final String place;
  final String detail;
  final Color primary;
  final Color secondary;
  final bool isHeader;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 92,
            child: Text(
              time,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: isHeader ? secondary : primary,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  place,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: primary,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  detail,
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(color: secondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Tile for a saved draft or purchased card.
class SavedGiftCardTile extends StatelessWidget {
  /// Creates a saved card tile.
  const SavedGiftCardTile({
    super.key,
    required this.card,
    required this.onTap,
    required this.onDelete,
  });

  /// Saved card snapshot.
  final GiftCardPlan card;

  /// Opens the card story.
  final VoidCallback onTap;

  /// Deletes the card.
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final recipient = card.recipient.trim().isEmpty
        ? 'Someone special'
        : card.recipient.trim();
    final statusColor = card.status == GiftCardStatus.purchased
        ? violet
        : coral;

    return Dismissible(
      key: ValueKey(card.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDelete(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 18),
        decoration: BoxDecoration(
          color: coral,
          borderRadius: BorderRadius.circular(22),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: onTap,
          child: Ink(
            padding: const EdgeInsets.all(16),
            decoration: panelDecoration(),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [statusColor, const Color(0xFF0A4CFF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(17),
                  ),
                  child: const Icon(Icons.card_giftcard, color: Colors.white),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        recipient,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w900),
                      ),
                      Text(
                        '${formatDate(card.date)} - ${card.gifts.length} stops',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.black.withValues(alpha: 0.56),
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${card.total}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      card.status == GiftCardStatus.purchased
                          ? 'PURCHASED'
                          : 'DRAFT',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Empty state for the saved card list.
class EmptyGiftCardsView extends StatelessWidget {
  /// Creates an empty saved cards view.
  const EmptyGiftCardsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          'No gift cards yet. Start customizing one and it will appear here.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: Colors.black.withValues(alpha: 0.58),
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}

/// Story panel for a saved card detail view.
class CardStoryPanel extends StatelessWidget {
  /// Creates a saved card story panel.
  const CardStoryPanel({super.key, required this.card});

  /// Saved card snapshot.
  final GiftCardPlan card;

  @override
  Widget build(BuildContext context) {
    final recipient = card.recipient.trim().isEmpty
        ? 'Someone special'
        : card.recipient.trim();
    final opening = card.status == GiftCardStatus.purchased
        ? 'This card is ready to send.'
        : 'This card is still a draft.';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            opening,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            '$recipient gets a planned experience day on ${formatDate(card.date)}. '
            'The card includes the personal note, every booked stop, and a clear '
            'schedule for where to be throughout the day.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.black.withValues(alpha: 0.62),
              height: 1.35,
            ),
          ),
        ],
      ),
    );
  }
}
