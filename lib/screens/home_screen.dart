import 'package:flutter/material.dart';

import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/helpers.dart';
import '../widgets/custom_button.dart';

/// First screen that lets users choose how to start planning a gift.
class StartPage extends StatelessWidget {
  /// Creates the app start page.
  const StartPage({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return Scaffold(
          body: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF062B8F),
                  Color(0xFFB72BFF),
                  Color(0xFFFF4FA3),
                ],
              ),
            ),
            child: SafeArea(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 22, 22, 28),
                children: [
                  const BrandHeader(onDark: true),
                  const SizedBox(height: 34),
                  Text(
                    'Choose the experience you want to gift.',
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      height: 1.02,
                    ),
                  ),
                  const SizedBox(height: 30),
                  StartActionCard(
                    number: '1',
                    title: 'See ready experiences',
                    description: 'Choose a pre-planned day and edit it after.',
                    icon: Icons.auto_awesome,
                    color: gold,
                    onTap: () => push(
                      context,
                      ReadyPackagesPage(controller: controller),
                    ),
                  ),
                  const SizedBox(height: 14),
                  StartActionCard(
                    number: '2',
                    title: 'Build it myself',
                    description: 'Choose Food, Sports, Travel, and time slots.',
                    icon: Icons.tune,
                    color: coral,
                    onTap: () =>
                        push(context, BuilderMenuPage(controller: controller)),
                  ),
                  const SizedBox(height: 14),
                  StartActionCard(
                    number: '3',
                    title: 'View my gift card',
                    description: '${controller.savedCards.length} saved cards.',
                    icon: Icons.credit_card,
                    color: violet,
                    onTap: () =>
                        push(context, GiftCardsPage(controller: controller)),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Screen that displays ready-made gift package options.
class ReadyPackagesPage extends StatelessWidget {
  /// Creates the ready packages page.
  const ReadyPackagesPage({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    final packages = controller.apiService.getReadyPackages();

    return Scaffold(
      appBar: appBar(context, 'Ready packages'),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        itemCount: packages.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final package = packages[index];
          return ReadyPackageCard(
            controller: controller,
            package: package,
            onTap: () => push(
              context,
              ReadyPackageDetailPage(controller: controller, package: package),
            ),
          );
        },
      ),
    );
  }
}

/// Screen that reveals the itinerary for a ready-made package.
class ReadyPackageDetailPage extends StatelessWidget {
  /// Creates a ready package detail page.
  const ReadyPackageDetailPage({
    super.key,
    required this.controller,
    required this.package,
  });

  /// Shared gift plan controller.
  final GiftPlanController controller;

  /// Package shown on this page.
  final ReadyPackage package;

  @override
  Widget build(BuildContext context) {
    final gifts = package.items
        .map(controller.apiService.packageItemToGift)
        .whereType<PlannedGift>()
        .toList();
    final total = gifts.fold<int>(0, (sum, gift) => sum + gift.place.price);

    return Scaffold(
      appBar: appBar(context, package.name),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(26),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: Image.asset(package.imageAsset, fit: BoxFit.cover),
            ),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: Text(
                  package.description,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                    height: 1.18,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '\$$total',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: package.themeColor,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          DayTimeline(gifts: gifts),
          const SizedBox(height: 14),
          FilledButton.icon(
            onPressed: () {
              final error = controller.usePackage(package);
              if (error != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(error),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
                return;
              }
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (_) => BuilderMenuPage(controller: controller),
                ),
              );
            },
            icon: const Icon(Icons.edit),
            label: const Text('Use package and edit'),
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ],
      ),
    );
  }
}

/// Screen that lets users configure card details and choose categories.
class BuilderMenuPage extends StatelessWidget {
  /// Creates the builder menu page.
  const BuilderMenuPage({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    final categories = controller.apiService.getCategories();

    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return Scaffold(
          appBar: appBar(context, 'Build your gift'),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
            children: [
              GiftSetupPanel(controller: controller),
              const SizedBox(height: 18),
              CostPulse(controller: controller),
              const SizedBox(height: 22),
              Text(
                'Choose a category',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 10),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: categories.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.12,
                ),
                itemBuilder: (context, index) {
                  final category = categories[index];
                  return CategoryButton(
                    category: category,
                    onTap: () => push(
                      context,
                      CategoryPage(controller: controller, category: category),
                    ),
                  );
                },
              ),
              const SizedBox(height: 26),
              DayTimeline(
                gifts: controller.gifts,
                onRemove: controller.removeGift,
              ),
            ],
          ),
          bottomNavigationBar: GenerateBar(controller: controller),
        );
      },
    );
  }
}

/// Screen for choosing a subcategory and place inside one category.
class CategoryPage extends StatefulWidget {
  /// Creates a category detail page.
  const CategoryPage({
    super.key,
    required this.controller,
    required this.category,
  });

  /// Shared gift plan controller.
  final GiftPlanController controller;

  /// Category shown by this page.
  final GiftCategory category;

  @override
  State<CategoryPage> createState() => _CategoryPageState();
}

/// State for the currently selected subcategory.
class _CategoryPageState extends State<CategoryPage> {
  /// Subcategory currently selected by the user.
  late GiftSubcategory subcategory;

  @override
  void initState() {
    super.initState();
    subcategory = widget.category.subcategories.first;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBar(context, widget.category.name),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: widget.category.color,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: [
                Icon(widget.category.icon, color: Colors.white, size: 42),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.category.name,
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                      Text(
                        widget.category.subtitle,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.78),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          Text(
            'Choose type',
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: widget.category.subcategories.map((item) {
              return ChoiceChip(
                label: Text(item.name),
                selected: item == subcategory,
                onSelected: (_) => setState(() => subcategory = item),
              );
            }).toList(),
          ),
          const SizedBox(height: 22),
          Text(
            '${subcategory.name} places',
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          ...subcategory.places.map(
            (place) => PlaceSelectionCard(
              controller: widget.controller,
              category: widget.category,
              subcategory: subcategory,
              place: place,
            ),
          ),
        ],
      ),
    );
  }
}

/// Screen that shows the generated card preview and final itinerary.
class GeneratedCardPage extends StatefulWidget {
  /// Creates the generated card page.
  const GeneratedCardPage({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  State<GeneratedCardPage> createState() => _GeneratedCardPageState();
}

class _GeneratedCardPageState extends State<GeneratedCardPage> {
  bool _isBuying = false;
  GiftCardPlan? _issuedPlan;

  Future<void> _buyCard() async {
    if (widget.controller.gifts.isEmpty || _isBuying) return;

    setState(() => _isBuying = true);
    await Future<void>.delayed(const Duration(milliseconds: 1500));
    final plan = widget.controller.purchaseCurrentPlan();
    if (!mounted) return;
    setState(() {
      _isBuying = false;
      _issuedPlan = plan;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        return Scaffold(
          appBar: appBar(context, 'Generated card'),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 30),
            children: [
              CreditGiftCard.fromController(controller: widget.controller),
              const SizedBox(height: 24),
              Text(
                'Day timeline',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              DayTimeline(
                gifts: widget.controller.gifts,
                onRemove: widget.controller.removeGift,
              ),
              const SizedBox(height: 18),
              if (_issuedPlan == null)
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 280),
                  child: _isBuying
                      ? const PurchaseProcessingPanel()
                      : FilledButton.icon(
                          key: const ValueKey('buy-button'),
                          onPressed: widget.controller.gifts.isEmpty
                              ? null
                              : _buyCard,
                          icon: const Icon(Icons.shopping_bag),
                          label: const Text('Buy this gift card'),
                          style: FilledButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
                ),
              if (_issuedPlan != null) ...[
                const SizedBox(height: 18),
                PurchaseCelebration(plan: _issuedPlan!),
              ],
            ],
          ),
        );
      },
    );
  }
}

/// Screen that lists all saved drafts and purchased cards.
class GiftCardsPage extends StatelessWidget {
  /// Creates the saved cards page.
  const GiftCardsPage({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return Scaffold(
          appBar: appBar(context, 'My gift cards'),
          body: controller.savedCards.isEmpty
              ? const EmptyGiftCardsView()
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
                  itemCount: controller.savedCards.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final card = controller.savedCards[index];
                    return SavedGiftCardTile(
                      card: card,
                      onTap: () => push(
                        context,
                        GiftCardDetailPage(
                          card: card,
                          onDelete: () {
                            controller.deleteSavedCard(card.id);
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      onDelete: () => controller.deleteSavedCard(card.id),
                    );
                  },
                ),
        );
      },
    );
  }
}

/// Screen that shows one saved card story and itinerary.
class GiftCardDetailPage extends StatelessWidget {
  /// Creates a saved card detail page.
  const GiftCardDetailPage({
    super.key,
    required this.card,
    required this.onDelete,
  });

  /// Saved card snapshot.
  final GiftCardPlan card;

  /// Deletes this card from the library.
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBar(context, 'Gift card story'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          CreditGiftCard.fromPlan(card: card),
          const SizedBox(height: 18),
          CardStoryPanel(card: card),
          const SizedBox(height: 18),
          Text(
            'Where to be',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          GiftItineraryTable(gifts: card.gifts),
          const SizedBox(height: 18),
          OutlinedButton.icon(
            onPressed: onDelete,
            icon: const Icon(Icons.delete_outline),
            label: const Text('Delete this card'),
          ),
        ],
      ),
    );
  }
}

/// Sticky bottom bar that lets users open the generated gift card.
class GenerateBar extends StatelessWidget {
  /// Creates the generate-card bottom bar.
  const GenerateBar({super.key, required this.controller});

  /// Controller that provides gift count and total.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(20, 8, 20, 16),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: ink,
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.16),
              blurRadius: 18,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${controller.gifts.length} stops',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: Colors.white.withValues(alpha: 0.68),
                    ),
                  ),
                  Text(
                    '\$${controller.total}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            FilledButton.icon(
              onPressed: controller.gifts.isEmpty
                  ? null
                  : () => push(
                      context,
                      GeneratedCardPage(controller: controller),
                    ),
              icon: const Icon(Icons.credit_card),
              label: const Text('Generate card'),
              style: FilledButton.styleFrom(
                backgroundColor: gold,
                foregroundColor: ink,
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
