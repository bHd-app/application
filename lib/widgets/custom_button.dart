import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/helpers.dart';

/// Animated brand wordmark used at the top of the start screen.
class BrandHeader extends StatefulWidget {
  /// Creates the brand header.
  const BrandHeader({super.key, this.onDark = false});

  /// Whether the header is displayed on a dark background.
  final bool onDark;

  @override
  State<BrandHeader> createState() => _BrandHeaderState();
}

class _BrandHeaderState extends State<BrandHeader>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2600),
  )..repeat(reverse: true);

  late final Animation<double> _float = CurvedAnimation(
    parent: _controller,
    curve: Curves.easeInOut,
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.onDark ? const Color(0xFFC4B5FD) : violet;
    return Center(
      child: AnimatedBuilder(
        animation: _float,
        builder: (context, child) {
          final dy = -1.5 + (_float.value * 3);
          return Transform.translate(
            offset: Offset(0, dy),
            child: child,
          );
        },
        child: Text(
          'Expergift',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.displaySmall?.copyWith(
            color: color,
            fontWeight: FontWeight.w900,
            height: 1,
            shadows: widget.onDark
                ? [
                    Shadow(
                      color: violet.withValues(alpha: 0.34),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ]
                : null,
          ),
        ),
      ),
    );
  }
}

/// Real looping hero video for the home screen.
class ExperienceLoopHero extends StatefulWidget {
  /// Creates the home hero video.
  const ExperienceLoopHero({super.key});

  @override
  State<ExperienceLoopHero> createState() => _ExperienceLoopHeroState();
}

class _ExperienceLoopHeroState extends State<ExperienceLoopHero> {
  VideoPlayerController? controller;
  bool isReady = false;

  @override
  void initState() {
    super.initState();
    try {
      final videoController = VideoPlayerController.asset(
        'assets/hero_video/experience_loop.mp4',
        videoPlayerOptions: VideoPlayerOptions(mixWithOthers: true),
      );
      controller = videoController;
      videoController
        ..setLooping(true)
        ..setVolume(0);
      videoController
          .initialize()
          .then((_) {
            if (!mounted) return;
            setState(() => isReady = true);
            videoController.play();
          })
          .catchError((_) {
            if (!mounted) return;
            setState(() => isReady = false);
          });
    } on UnimplementedError {
      controller = null;
    }
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: SizedBox(
        height: 154,
        width: double.infinity,
        child: isReady && controller != null
            ? FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: controller!.value.size.width,
                  height: controller!.value.size.height,
                  child: VideoPlayer(controller!),
                ),
              )
            : Image.asset(
                'assets/hero_video/date_night.jpg',
                fit: BoxFit.cover,
              ),
      ),
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
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: paper,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: line),
            boxShadow: [
              BoxShadow(
                color: ink.withValues(alpha: 0.05),
                blurRadius: 18,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: ActionBadgeArt(icon: icon, color: color, number: number),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: ink,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: mutedInk,
                        height: 1.25,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                color: mutedInk.withValues(alpha: 0.7),
                size: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Small generated-style badge art for home actions.
class ActionBadgeArt extends StatelessWidget {
  /// Creates action badge art.
  const ActionBadgeArt({
    super.key,
    required this.icon,
    required this.color,
    required this.number,
  });

  /// Main action icon.
  final IconData icon;

  /// Accent color.
  final Color color;

  /// Step number.
  final String number;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              color.withValues(alpha: 0.16),
              color.withValues(alpha: 0.06),
              paper,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              right: -10,
              bottom: -12,
              child: Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.14),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Center(child: Icon(icon, color: color, size: 26)),
            Positioned(
              top: 5,
              right: 7,
              child: Text(
                number,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
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
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            color: paper,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: line),
            boxShadow: [
              BoxShadow(
                color: package.themeColor.withValues(alpha: 0.14),
                blurRadius: 18,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: PackageSymbolArt(
                    label: package.name,
                    color: package.themeColor,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  package.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${gifts.length} stops - \$$total',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: mutedInk,
                    fontWeight: FontWeight.w700,
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

/// Symbolic square artwork for ready-made packages.
class PackageSymbolArt extends StatelessWidget {
  /// Creates symbolic package artwork.
  const PackageSymbolArt({super.key, required this.label, required this.color});

  /// Package label used to choose a symbol.
  final String label;

  /// Package color.
  final Color color;

  IconData get symbol {
    final lower = label.toLowerCase();
    if (lower.contains('romantic')) return Icons.favorite_rounded;
    if (lower.contains('adventure')) return Icons.terrain_rounded;
    if (lower.contains('relax')) return Icons.spa_rounded;
    return Icons.auto_awesome_rounded;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: LinearGradient(
          colors: [
            color.withValues(alpha: 0.95),
            color.withValues(alpha: 0.62),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -18,
            top: -18,
            child: Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.18),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            left: -18,
            bottom: -22,
            child: Container(
              width: 86,
              height: 86,
              decoration: BoxDecoration(
                color: ink.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Center(child: Icon(symbol, color: Colors.white, size: 42)),
        ],
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

/// Compact profile summary without card recipient/message fields.
class ProfileSummaryPanel extends StatelessWidget {
  /// Creates profile summary.
  const ProfileSummaryPanel({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: panelDecoration(),
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: mint.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Icon(Icons.person_rounded, color: mint),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Expergift profile',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${controller.savedCards.length} saved cards - ${controller.gifts.length} selected stops',
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(color: mutedInk),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
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
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Card details',
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: pickDate,
            child: Ink(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: gold.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: gold.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.event_available, color: ink),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Gift date: ${formatDate(widget.controller.date)}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  const Icon(Icons.edit_calendar, color: mutedInk),
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
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFF102033), Color(0xFF145A5A), Color(0xFF0E9F6E)],
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
                    color: Colors.white.withValues(alpha: 0.76),
                    fontWeight: FontWeight.w700,
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
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
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
    this.isSelected = false,
  });

  /// Category displayed by this tile.
  final GiftCategory category;

  /// Callback invoked when the tile is tapped.
  final VoidCallback onTap;

  /// Whether this category is currently selected.
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isSelected ? ink : paper,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: isSelected ? ink : line),
            boxShadow: [
              BoxShadow(
                color: ink.withValues(alpha: isSelected ? 0.12 : 0.04),
                blurRadius: isSelected ? 18 : 12,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 78,
                child: CategoryArtwork(
                  icon: category.icon,
                  color: category.color,
                  imageAsset: category.imageAsset,
                  onDark: isSelected,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                category.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: isSelected ? Colors.white : ink,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                category.subtitle,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: isSelected
                      ? Colors.white.withValues(alpha: 0.72)
                      : mutedInk,
                  height: 1.15,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Modern generated-style category artwork.
class CategoryArtwork extends StatelessWidget {
  /// Creates category artwork.
  const CategoryArtwork({
    super.key,
    required this.icon,
    required this.color,
    required this.imageAsset,
    this.onDark = false,
  });

  /// Category icon.
  final IconData icon;

  /// Category color.
  final Color color;

  /// Generated category image asset.
  final String imageAsset;

  /// Whether artwork sits on a selected dark tile.
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(imageAsset, fit: BoxFit.cover),
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.black.withValues(alpha: 0.02),
                  Colors.black.withValues(alpha: onDark ? 0.44 : 0.24),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          Positioned(
            left: 8,
            bottom: 8,
            child: Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: ink.withValues(alpha: 0.12),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(icon, color: color, size: 20),
            ),
          ),
        ],
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
    this.popAfterAdd = true,
    this.buttonLabel = 'Add and return to menu',
  });

  /// Controller that receives the selected planned gift.
  final GiftPlanController controller;

  /// Parent category for the place.
  final GiftCategory category;

  /// Parent subcategory for the place.
  final GiftSubcategory subcategory;

  /// Place displayed by this card.
  final GiftPlace place;

  /// Whether the page should close after a successful add.
  final bool popAfterAdd;

  /// Button label shown for the add action.
  final String buttonLabel;

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
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: widget.category.color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.star_rounded,
                          size: 15,
                          color: widget.category.color,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          widget.place.rating.toStringAsFixed(1),
                          style: Theme.of(context).textTheme.labelMedium
                              ?.copyWith(
                                fontWeight: FontWeight.w900,
                                color: ink,
                              ),
                        ),
                      ],
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
                if (widget.popAfterAdd) Navigator.pop(context);
              },
              icon: const Icon(Icons.add_circle),
              label: Text(widget.buttonLabel),
              style: FilledButton.styleFrom(
                backgroundColor: widget.category.color,
                foregroundColor: Colors.white,
              ),
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
        padding: const EdgeInsets.all(20),
        decoration: panelDecoration(),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: sky.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.route_outlined, color: sky),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Your day is empty. Pick a category or start from a ready package.',
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: mutedInk, height: 1.3),
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: List.generate(gifts.length, (index) {
        final gift = gifts[index];
        return Container(
          margin: EdgeInsets.only(bottom: index == gifts.length - 1 ? 0 : 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: paper,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: line),
          ),
          child: Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: gift.color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(15),
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
                      style: Theme.of(
                        context,
                      ).textTheme.bodySmall?.copyWith(color: mutedInk),
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
      }),
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
       status = GiftCardStatus.draft,
       gifts = List<PlannedGift>.unmodifiable(controller.gifts);

  /// Creates a generated gift card preview from a saved card.
  CreditGiftCard.fromPlan({super.key, required GiftCardPlan card})
    : recipient = card.recipient,
      note = card.note,
      date = card.date,
      total = card.total,
      cardNumber = card.cardNumber ?? '5482 0917 4421',
      status = card.status,
      gifts = card.gifts;

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

  /// Selected experiences used to theme the card.
  final List<PlannedGift> gifts;

  @override
  Widget build(BuildContext context) {
    final displayRecipient = recipient.trim().isEmpty
        ? 'Someone special'
        : recipient.trim();
    final displayNote = note.trim().isEmpty
        ? 'A full day of gifts, planned with care.'
        : note.trim();
    final firstColor = gifts.isEmpty ? mint : gifts.first.color;
    final secondColor = gifts.length > 1 ? gifts.last.color : coral;
    final dominantIcon = gifts.isEmpty
        ? Icons.auto_awesome_rounded
        : gifts.first.icon;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: [
            ink,
            firstColor.withValues(alpha: 0.82),
            secondColor.withValues(alpha: 0.78),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: ink.withValues(alpha: 0.18),
            blurRadius: 28,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -26,
            top: -22,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            right: 18,
            bottom: 28,
            child: Transform.rotate(
              angle: -0.4,
              child: Icon(
                dominantIcon,
                color: Colors.white.withValues(alpha: 0.16),
                size: 96,
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.16),
                      ),
                    ),
                    child: Icon(dominantIcon, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'EXPERGIFT',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: Colors.white.withValues(alpha: 0.78),
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 26),
              Text(
                displayRecipient,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  height: 1.04,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                displayNote,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.82),
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 26),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: gifts.take(3).map((gift) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 7,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.13),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.13),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(gift.icon, color: Colors.white, size: 15),
                        const SizedBox(width: 5),
                        Text(
                          gift.category,
                          style: Theme.of(context).textTheme.labelMedium
                              ?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                              ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: CardMeta(label: 'DATE', value: shortDate(date)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: CardMeta(label: 'VALUE', value: '\$$total'),
                  ),
                ],
              ),
              if (status == GiftCardStatus.purchased) ...[
                const SizedBox(height: 12),
                Text(
                  'Issued ${cardNumber.substring(cardNumber.length - 4)}',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.58),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
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
          colors: [Color(0xFF102033), Color(0xFF0E9F6E)],
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
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          colors: [Color(0xFF102033), Color(0xFF145A5A), Color(0xFFF15A46)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: mint.withValues(alpha: 0.2),
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
    final borderColor = onDark ? Colors.white.withValues(alpha: 0.14) : line;
    final primary = onDark ? Colors.white : ink;
    final secondary = onDark ? Colors.white.withValues(alpha: 0.72) : mutedInk;

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
                      colors: [statusColor, const Color(0xFF134E4A)],
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
                        style: Theme.of(
                          context,
                        ).textTheme.bodySmall?.copyWith(color: mutedInk),
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
            color: mutedInk,
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
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: mutedInk, height: 1.35),
          ),
        ],
      ),
    );
  }
}
