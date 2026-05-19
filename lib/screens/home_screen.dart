import 'package:flutter/material.dart';

import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/helpers.dart';
import '../widgets/custom_button.dart';

/// First screen shell that owns the four main app tabs.
class StartPage extends StatefulWidget {
  /// Creates the app start page.
  const StartPage({super.key, required this.controller, this.initialTab = 0});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  /// Tab selected when the shell opens.
  final int initialTab;

  @override
  State<StartPage> createState() => _StartPageState();
}

class _StartPageState extends State<StartPage> {
  late int selectedTab = widget.initialTab.clamp(0, 3);

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        return Scaffold(
          body: IndexedStack(
            index: selectedTab,
            children: [
              _HomeTab(
                controller: widget.controller,
                onChooseCategories: () => setState(() => selectedTab = 1),
              ),
              ExperienceCategoriesTab(controller: widget.controller),
              SelectedExperiencesTab(controller: widget.controller),
              ProfileTab(controller: widget.controller),
            ],
          ),
          bottomNavigationBar: NavigationBar(
            selectedIndex: selectedTab,
            onDestinationSelected: (index) =>
                setState(() => selectedTab = index),
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home_rounded),
                label: 'Home',
              ),
              NavigationDestination(
                icon: Icon(Icons.category_outlined),
                selectedIcon: Icon(Icons.category_rounded),
                label: 'Categories',
              ),
              NavigationDestination(
                icon: Icon(Icons.fact_check_outlined),
                selectedIcon: Icon(Icons.fact_check_rounded),
                label: 'Selected',
              ),
              NavigationDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person_rounded),
                label: 'Profile',
              ),
            ],
          ),
        );
      },
    );
  }
}

class _HomeTab extends StatelessWidget {
  const _HomeTab({required this.controller, required this.onChooseCategories});

  final GiftPlanController controller;
  final VoidCallback onChooseCategories;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        const _StartBackdrop(),
        SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const BrandHeader(onDark: true),
                const SizedBox(height: 18),
                const ExperienceLoopHero(),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: panelDecoration(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Choose the experience you want to gift.',
                        style: Theme.of(context).textTheme.headlineMedium
                            ?.copyWith(
                              fontWeight: FontWeight.w900,
                              height: 1.06,
                            ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Curate a full day, start from a polished package, or return to a saved card.',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: mutedInk,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                StartActionCard(
                  number: '1',
                  title: 'See ready experiences',
                  description: 'Choose a pre-planned day and edit it after.',
                  icon: Icons.auto_awesome_rounded,
                  color: gold,
                  onTap: () =>
                      push(context, ReadyPackagesPage(controller: controller)),
                ),
                const SizedBox(height: 12),
                StartActionCard(
                  number: '2',
                  title: 'Build it myself',
                  description: 'Choose Food, Sports, Travel, and time slots.',
                  icon: Icons.tune_rounded,
                  color: coral,
                  onTap: onChooseCategories,
                ),
                const SizedBox(height: 12),
                StartActionCard(
                  number: '3',
                  title: 'View my gift card',
                  description: '${controller.savedCards.length} saved cards.',
                  icon: Icons.credit_card_rounded,
                  color: violet,
                  onTap: () =>
                      push(context, GiftCardsPage(controller: controller)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StartBackdrop extends StatelessWidget {
  const _StartBackdrop();

  @override
  Widget build(BuildContext context) {
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF111827), Color(0xFF263B57), cream],
          stops: [0, 0.3, 0.3],
        ),
      ),
      child: SizedBox.expand(),
    );
  }
}

/// Tab that shows the current selected itinerary.
class SelectedExperiencesTab extends StatelessWidget {
  /// Creates the selected experiences tab.
  const SelectedExperiencesTab({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          Text(
            'Selected experiences',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 14),
          CostPulse(controller: controller),
          const SizedBox(height: 18),
          DayTimeline(gifts: controller.gifts, onRemove: controller.removeGift),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: controller.gifts.isEmpty
                ? null
                : () => push(context, CardSetupPage(controller: controller)),
            icon: const Icon(Icons.arrow_forward_rounded),
            label: const Text('Continue'),
          ),
        ],
      ),
    );
  }
}

/// Tab for profile and card personalization.
class ProfileTab extends StatelessWidget {
  /// Creates the profile tab.
  const ProfileTab({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          Text(
            'Profile',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 14),
          ProfileSummaryPanel(controller: controller),
          const SizedBox(height: 16),
          StartActionCard(
            number: '${controller.savedCards.length}',
            title: 'Saved gift cards',
            description: 'Drafts and purchased gift cards live here.',
            icon: Icons.wallet_giftcard_rounded,
            color: violet,
            onTap: () => push(context, GiftCardsPage(controller: controller)),
          ),
        ],
      ),
    );
  }
}

/// Tab that lists all gift categories.
class ExperienceCategoriesTab extends StatelessWidget {
  /// Creates the category chooser tab.
  const ExperienceCategoriesTab({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return ExperienceCategoriesView(controller: controller);
  }
}

/// Full category chooser used by the tab and standalone routes.
class ExperienceCategoriesView extends StatelessWidget {
  /// Creates the category chooser.
  const ExperienceCategoriesView({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    final categories = controller.apiService.getCategories();

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          Text(
            'Choose experience',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            'Pick a category, choose the exact experience, and it will return here after adding.',
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: mutedInk, height: 1.35),
          ),
          const SizedBox(height: 18),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: categories.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.98,
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
        ],
      ),
    );
  }
}

/// Standalone route for choosing an experience category.
class ExperienceCategoriesPage extends StatelessWidget {
  /// Creates the standalone category chooser page.
  const ExperienceCategoriesPage({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBar(context, 'Choose experience'),
      body: ExperienceCategoriesView(controller: controller),
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
      body: GridView.builder(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.82,
        ),
        itemCount: packages.length,
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
                  builder: (_) =>
                      StartPage(controller: controller, initialTab: 2),
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
class BuilderMenuPage extends StatefulWidget {
  /// Creates the builder menu page.
  const BuilderMenuPage({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  State<BuilderMenuPage> createState() => _BuilderMenuPageState();
}

class _BuilderMenuPageState extends State<BuilderMenuPage> {
  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        return Scaffold(
          appBar: appBar(context, 'Build your gift'),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 120),
            children: [
              GiftSetupPanel(controller: widget.controller),
              const SizedBox(height: 18),
              CostPulse(controller: widget.controller),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: () => push(
                    context,
                    ExperienceCategoriesPage(controller: widget.controller),
                  ),
                  icon: const Icon(Icons.apps_rounded),
                  label: const Text('Choose experience'),
                  style: FilledButton.styleFrom(
                    backgroundColor: paper,
                    foregroundColor: ink,
                    side: const BorderSide(color: line),
                    elevation: 0,
                    shadowColor: Colors.transparent,
                    disabledBackgroundColor: line,
                    textStyle: Theme.of(context).textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.w900),
                    padding: const EdgeInsets.symmetric(vertical: 19),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 26),
              DayTimeline(
                gifts: widget.controller.gifts,
                onRemove: widget.controller.removeGift,
              ),
            ],
          ),
          bottomNavigationBar: GenerateBar(controller: widget.controller),
        );
      },
    );
  }
}

/// Inline category and place picker used by the builder screen.
class InlineExperiencePicker extends StatefulWidget {
  /// Creates an inline experience picker.
  const InlineExperiencePicker({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  State<InlineExperiencePicker> createState() => _InlineExperiencePickerState();
}

class _InlineExperiencePickerState extends State<InlineExperiencePicker> {
  GiftCategory? selectedCategory;
  GiftSubcategory? selectedSubcategory;

  @override
  Widget build(BuildContext context) {
    final categories = widget.controller.apiService.getCategories();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Experience type',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          LayoutBuilder(
            builder: (context, constraints) {
              final count = constraints.maxWidth > 430 ? 4 : 3;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: categories.length,
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: count,
                  crossAxisSpacing: 9,
                  mainAxisSpacing: 9,
                  childAspectRatio: 1.04,
                ),
                itemBuilder: (context, index) {
                  final category = categories[index];
                  return CategoryButton(
                    category: category,
                    isSelected: selectedCategory == category,
                    onTap: () => setState(() {
                      selectedCategory = category;
                      selectedSubcategory = category.subcategories.first;
                    }),
                  );
                },
              );
            },
          ),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 260),
            child: selectedCategory == null || selectedSubcategory == null
                ? const SizedBox.shrink()
                : Padding(
                    key: ValueKey(selectedCategory!.name),
                    padding: const EdgeInsets.only(top: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          selectedCategory!.name,
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: selectedCategory!.subcategories.map((item) {
                            return ChoiceChip(
                              label: Text(item.name),
                              selected: item == selectedSubcategory,
                              onSelected: (_) =>
                                  setState(() => selectedSubcategory = item),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 14),
                        ...selectedSubcategory!.places.map(
                          (place) => PlaceSelectionCard(
                            controller: widget.controller,
                            category: selectedCategory!,
                            subcategory: selectedSubcategory!,
                            place: place,
                            popAfterAdd: false,
                            buttonLabel: 'Add experience',
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
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
              color: widget.category.color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: widget.category.color.withValues(alpha: 0.22),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: 92,
                  child: CategoryArtwork(
                    icon: widget.category.icon,
                    color: widget.category.color,
                    imageAsset: widget.category.imageAsset,
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  widget.category.name,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: ink,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  widget.category.subtitle,
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: mutedInk),
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
class CardSetupPage extends StatefulWidget {
  /// Creates the card personalization page.
  const CardSetupPage({super.key, required this.controller});

  /// Shared gift plan controller.
  final GiftPlanController controller;

  @override
  State<CardSetupPage> createState() => _CardSetupPageState();
}

class _CardSetupPageState extends State<CardSetupPage> {
  late final TextEditingController recipientController;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBar(context, 'Card details'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          Text(
            'Who is this gift for?',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            'Add the recipient name and the message that should appear on the generated card.',
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: mutedInk, height: 1.35),
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: panelDecoration(),
            child: Column(
              children: [
                TextField(
                  controller: recipientController,
                  onChanged: widget.controller.updateRecipient,
                  decoration: const InputDecoration(
                    labelText: 'Recipient name',
                    prefixIcon: Icon(Icons.person_rounded),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: noteController,
                  onChanged: widget.controller.updateNote,
                  minLines: 3,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    labelText: 'Message on card',
                    prefixIcon: Icon(Icons.notes_rounded),
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          DayTimeline(gifts: widget.controller.gifts),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: () =>
                push(context, GeneratedCardPage(controller: widget.controller)),
            icon: const Icon(Icons.auto_awesome_rounded),
            label: const Text('Generate card'),
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
                      : SizedBox(
                          key: const ValueKey('buy-button'),
                          width: double.infinity,
                          child: FilledButton.icon(
                            onPressed: widget.controller.gifts.isEmpty
                                ? null
                                : _buyCard,
                            icon: const Icon(Icons.shopping_bag),
                            label: const Text('Buy this gift card'),
                            style: FilledButton.styleFrom(
                              minimumSize: const Size.fromHeight(60),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 22,
                                vertical: 20,
                              ),
                              textStyle: Theme.of(context).textTheme.titleMedium
                                  ?.copyWith(fontWeight: FontWeight.w900),
                            ),
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
          color: paper,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: line),
          boxShadow: [
            BoxShadow(
              color: ink.withValues(alpha: 0.12),
              blurRadius: 24,
              offset: const Offset(0, 12),
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
                      color: mutedInk,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    '\$${controller.total}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: ink,
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
                backgroundColor: ink,
                foregroundColor: Colors.white,
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
