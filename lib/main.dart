import 'package:flutter/material.dart';

void main() {
  runApp(const GiftNestApp());
}

const ink = Color(0xFF161214);
const cream = Color(0xFFFFF5EA);
const coral = Color(0xFFFF5A4F);
const gold = Color(0xFFFFC05A);
const violet = Color(0xFF7C5CFF);

class GiftNestApp extends StatefulWidget {
  const GiftNestApp({super.key});

  @override
  State<GiftNestApp> createState() => _GiftNestAppState();
}

class _GiftNestAppState extends State<GiftNestApp> {
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
        textTheme: Theme.of(context).textTheme.apply(
              bodyColor: ink,
              displayColor: ink,
            ),
      ),
      home: StartPage(controller: controller),
    );
  }
}

class GiftPlanController extends ChangeNotifier {
  DateTime date = DateTime.now().add(const Duration(days: 7));
  String recipient = 'Maya';
  String note = 'A whole day of little surprises, planned just for you.';
  final List<PlannedGift> gifts = [];

  int get total => gifts.fold(0, (sum, gift) => sum + gift.place.price);

  void updateDate(DateTime value) {
    date = value;
    notifyListeners();
  }

  void updateRecipient(String value) {
    recipient = value;
    notifyListeners();
  }

  void updateNote(String value) {
    note = value;
    notifyListeners();
  }

  void addGift(PlannedGift gift) {
    gifts.add(gift);
    gifts.sort((a, b) => slotSortValue(a.slot).compareTo(slotSortValue(b.slot)));
    notifyListeners();
  }

  void removeGift(PlannedGift gift) {
    gifts.remove(gift);
    notifyListeners();
  }

  void usePackage(ReadyPackage package) {
    gifts
      ..clear()
      ..addAll(package.items.map(packageItemToGift).whereType<PlannedGift>());
    gifts.sort((a, b) => slotSortValue(a.slot).compareTo(slotSortValue(b.slot)));
    notifyListeners();
  }
}

class GiftCategory {
  const GiftCategory({
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.subcategories,
  });

  final String name;
  final String subtitle;
  final IconData icon;
  final Color color;
  final List<GiftSubcategory> subcategories;
}

class GiftSubcategory {
  const GiftSubcategory({required this.name, required this.places});

  final String name;
  final List<GiftPlace> places;
}

class GiftPlace {
  const GiftPlace({
    required this.name,
    required this.description,
    required this.price,
    required this.rating,
    required this.slots,
  });

  final String name;
  final String description;
  final int price;
  final double rating;
  final List<String> slots;
}

class PlannedGift {
  const PlannedGift({
    required this.category,
    required this.subcategory,
    required this.place,
    required this.slot,
    required this.icon,
    required this.color,
  });

  final String category;
  final String subcategory;
  final GiftPlace place;
  final String slot;
  final IconData icon;
  final Color color;
}

class ReadyPackage {
  const ReadyPackage({
    required this.name,
    required this.description,
    required this.themeColor,
    required this.items,
  });

  final String name;
  final String description;
  final Color themeColor;
  final List<PackageItem> items;
}

class PackageItem {
  const PackageItem({
    required this.categoryName,
    required this.subcategoryName,
    required this.placeName,
    required this.slot,
  });

  final String categoryName;
  final String subcategoryName;
  final String placeName;
  final String slot;
}

const categories = [
  GiftCategory(
    name: 'Food',
    subtitle: 'Restaurants, cafes, desserts',
    icon: Icons.restaurant,
    color: Color(0xFFFF5A4F),
    subcategories: [
      GiftSubcategory(
        name: 'Restaurant',
        places: [
          GiftPlace(
            name: 'Luna Table',
            description: 'A warm set-menu dinner with dessert included.',
            price: 180,
            rating: 4.8,
            slots: ['2:00 - 4:00 PM', '6:00 - 8:00 PM', '8:30 - 10:00 PM'],
          ),
          GiftPlace(
            name: 'Saffron House',
            description: 'Family-style mains, fresh bread, and tea service.',
            price: 150,
            rating: 4.7,
            slots: ['1:00 - 3:00 PM', '5:00 - 7:00 PM', '7:30 - 9:30 PM'],
          ),
          GiftPlace(
            name: 'North Grill',
            description: 'Steak, sides, drinks, and a table by the window.',
            price: 210,
            rating: 4.9,
            slots: ['4:00 - 6:00 PM', '6:30 - 8:30 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Cafe',
        places: [
          GiftPlace(
            name: 'Cloud Cafe',
            description: 'Coffee tasting, pastries, and a quiet table.',
            price: 55,
            rating: 4.6,
            slots: ['9:00 - 10:30 AM', '11:00 AM - 12:30 PM', '3:00 - 4:30 PM'],
          ),
          GiftPlace(
            name: 'Bean & Bloom',
            description: 'Brunch board, specialty drinks, and flowers.',
            price: 75,
            rating: 4.7,
            slots: ['10:00 AM - 12:00 PM', '12:30 - 2:00 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Ice Cream',
        places: [
          GiftPlace(
            name: 'Melt Studio',
            description: 'Gelato flight with custom toppings.',
            price: 40,
            rating: 4.5,
            slots: ['1:00 - 2:00 PM', '4:00 - 5:00 PM', '7:00 - 8:00 PM'],
          ),
          GiftPlace(
            name: 'Sweet Peak',
            description: 'Dessert card for two with seasonal flavors.',
            price: 45,
            rating: 4.6,
            slots: ['2:00 - 3:00 PM', '5:00 - 6:00 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Sports',
    subtitle: 'Football, basketball, action',
    icon: Icons.sports_soccer,
    color: Color(0xFF19A86B),
    subcategories: [
      GiftSubcategory(
        name: 'Football',
        places: [
          GiftPlace(
            name: 'Derby Match',
            description: 'Two seats, snack credit, and a team scarf.',
            price: 220,
            rating: 4.9,
            slots: ['3:00 - 5:00 PM', '7:00 - 9:00 PM'],
          ),
          GiftPlace(
            name: 'Five-a-side Arena',
            description: 'Private pitch booking with drinks after the game.',
            price: 120,
            rating: 4.6,
            slots: ['10:00 AM - 12:00 PM', '5:00 - 7:00 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Basketball',
        places: [
          GiftPlace(
            name: 'Courtside Club',
            description: 'Game night package with premium seats.',
            price: 190,
            rating: 4.8,
            slots: ['6:00 - 8:00 PM', '8:30 - 10:30 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Travel',
    subtitle: 'Hotels, tours, city escapes',
    icon: Icons.flight_takeoff,
    color: Color(0xFF3478F6),
    subcategories: [
      GiftSubcategory(
        name: 'Hotel',
        places: [
          GiftPlace(
            name: 'Harbor Stay',
            description: 'Boutique hotel credit with late checkout.',
            price: 260,
            rating: 4.7,
            slots: ['3:00 PM check-in', '6:00 PM check-in'],
          ),
          GiftPlace(
            name: 'Skyline Suite',
            description: 'City-view room and breakfast for two.',
            price: 340,
            rating: 4.9,
            slots: ['2:00 PM check-in', '4:00 PM check-in'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Tour',
        places: [
          GiftPlace(
            name: 'Old City Walk',
            description: 'Guided local tour with food stops.',
            price: 95,
            rating: 4.6,
            slots: ['10:00 AM - 12:00 PM', '2:00 - 4:00 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Wellness',
    subtitle: 'Spa, yoga, calm hours',
    icon: Icons.spa,
    color: Color(0xFF9B5DE5),
    subcategories: [
      GiftSubcategory(
        name: 'Spa',
        places: [
          GiftPlace(
            name: 'Still Water Spa',
            description: 'Massage, sauna, and tea service.',
            price: 160,
            rating: 4.8,
            slots: ['9:00 - 11:00 AM', '1:00 - 3:00 PM', '5:00 - 7:00 PM'],
          ),
          GiftPlace(
            name: 'Glow Room',
            description: 'Facial treatment and relaxation lounge.',
            price: 130,
            rating: 4.7,
            slots: ['11:00 AM - 1:00 PM', '4:00 - 6:00 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Yoga',
        places: [
          GiftPlace(
            name: 'Morning Flow',
            description: 'Private yoga class and smoothie bar.',
            price: 90,
            rating: 4.5,
            slots: ['8:00 - 9:30 AM', '6:00 - 7:30 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Music',
    subtitle: 'Concerts, jazz, live nights',
    icon: Icons.music_note,
    color: Color(0xFFFF9F1C),
    subcategories: [
      GiftSubcategory(
        name: 'Concert',
        places: [
          GiftPlace(
            name: 'Velvet Stage',
            description: 'Live show tickets and drink credit.',
            price: 145,
            rating: 4.7,
            slots: ['7:00 - 9:00 PM', '9:30 - 11:30 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Jazz',
        places: [
          GiftPlace(
            name: 'Blue Note Room',
            description: 'Jazz table for two with dessert.',
            price: 125,
            rating: 4.8,
            slots: ['6:00 - 8:00 PM', '8:30 - 10:30 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Outdoor',
    subtitle: 'Kayak, hike, fresh air',
    icon: Icons.terrain,
    color: Color(0xFF00A6A6),
    subcategories: [
      GiftSubcategory(
        name: 'Kayak',
        places: [
          GiftPlace(
            name: 'River Paddle',
            description: 'Guided kayak route and picnic lunch.',
            price: 170,
            rating: 4.8,
            slots: ['9:00 AM - 12:00 PM', '1:00 - 4:00 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Hiking',
        places: [
          GiftPlace(
            name: 'Sunset Trail',
            description: 'Guided hike, snacks, and photo set.',
            price: 110,
            rating: 4.6,
            slots: ['8:00 - 11:00 AM', '4:00 - 7:00 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Art',
    subtitle: 'Galleries, classes, making',
    icon: Icons.palette,
    color: Color(0xFFE94F8A),
    subcategories: [
      GiftSubcategory(
        name: 'Workshop',
        places: [
          GiftPlace(
            name: 'Clay Studio',
            description: 'Pottery class and finished piece pickup.',
            price: 115,
            rating: 4.7,
            slots: ['11:00 AM - 1:00 PM', '3:00 - 5:00 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Gallery',
        places: [
          GiftPlace(
            name: 'Private Gallery Hour',
            description: 'Curated gallery visit with a small print.',
            price: 85,
            rating: 4.5,
            slots: ['12:00 - 1:30 PM', '5:00 - 6:30 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Movies',
    subtitle: 'Cinema, private screens',
    icon: Icons.movie,
    color: Color(0xFF6247AA),
    subcategories: [
      GiftSubcategory(
        name: 'Cinema',
        places: [
          GiftPlace(
            name: 'Premiere Seats',
            description: 'Luxury seats, popcorn, and drinks.',
            price: 70,
            rating: 4.6,
            slots: ['2:00 - 4:00 PM', '6:00 - 8:00 PM', '9:00 - 11:00 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Private Room',
        places: [
          GiftPlace(
            name: 'Screening Lounge',
            description: 'Private room with snacks for a favorite movie.',
            price: 180,
            rating: 4.8,
            slots: ['3:00 - 5:00 PM', '8:00 - 10:00 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Learning',
    subtitle: 'Cooking, photo, skills',
    icon: Icons.school,
    color: Color(0xFF4D9078),
    subcategories: [
      GiftSubcategory(
        name: 'Cooking',
        places: [
          GiftPlace(
            name: 'Pasta Lab',
            description: 'Hands-on cooking class and dinner.',
            price: 135,
            rating: 4.7,
            slots: ['12:00 - 2:00 PM', '5:00 - 7:00 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Photography',
        places: [
          GiftPlace(
            name: 'Street Photo Walk',
            description: 'Photo lesson and edited mini album.',
            price: 100,
            rating: 4.6,
            slots: ['9:00 - 11:00 AM', '4:00 - 6:00 PM'],
          ),
        ],
      ),
    ],
  ),
  GiftCategory(
    name: 'Shopping',
    subtitle: 'Style, books, local stores',
    icon: Icons.local_mall,
    color: Color(0xFFB86F32),
    subcategories: [
      GiftSubcategory(
        name: 'Fashion',
        places: [
          GiftPlace(
            name: 'Style Session',
            description: 'Personal shopping appointment and store credit.',
            price: 200,
            rating: 4.7,
            slots: ['11:00 AM - 1:00 PM', '2:00 - 4:00 PM'],
          ),
        ],
      ),
      GiftSubcategory(
        name: 'Books',
        places: [
          GiftPlace(
            name: 'Bookshop Date',
            description: 'Book credit, coffee, and a wrapped surprise.',
            price: 65,
            rating: 4.8,
            slots: ['10:00 - 11:30 AM', '3:00 - 4:30 PM'],
          ),
        ],
      ),
    ],
  ),
];

const readyPackages = [
  ReadyPackage(
    name: 'Romantic Spark',
    description: 'Cafe, gallery, dinner, and a late jazz table.',
    themeColor: Color(0xFFE94F8A),
    items: [
      PackageItem(
        categoryName: 'Food',
        subcategoryName: 'Cafe',
        placeName: 'Bean & Bloom',
        slot: '10:00 AM - 12:00 PM',
      ),
      PackageItem(
        categoryName: 'Art',
        subcategoryName: 'Gallery',
        placeName: 'Private Gallery Hour',
        slot: '12:00 - 1:30 PM',
      ),
      PackageItem(
        categoryName: 'Food',
        subcategoryName: 'Restaurant',
        placeName: 'Luna Table',
        slot: '6:00 - 8:00 PM',
      ),
      PackageItem(
        categoryName: 'Music',
        subcategoryName: 'Jazz',
        placeName: 'Blue Note Room',
        slot: '8:30 - 10:30 PM',
      ),
    ],
  ),
  ReadyPackage(
    name: 'Adventure Saturday',
    description: 'Morning kayak, lunch, and a cinema finish.',
    themeColor: Color(0xFF00A6A6),
    items: [
      PackageItem(
        categoryName: 'Outdoor',
        subcategoryName: 'Kayak',
        placeName: 'River Paddle',
        slot: '9:00 AM - 12:00 PM',
      ),
      PackageItem(
        categoryName: 'Food',
        subcategoryName: 'Restaurant',
        placeName: 'Saffron House',
        slot: '1:00 - 3:00 PM',
      ),
      PackageItem(
        categoryName: 'Movies',
        subcategoryName: 'Cinema',
        placeName: 'Premiere Seats',
        slot: '6:00 - 8:00 PM',
      ),
    ],
  ),
  ReadyPackage(
    name: 'Relax Reset',
    description: 'Yoga, spa, ice cream, and hotel check-in.',
    themeColor: Color(0xFF9B5DE5),
    items: [
      PackageItem(
        categoryName: 'Wellness',
        subcategoryName: 'Yoga',
        placeName: 'Morning Flow',
        slot: '8:00 - 9:30 AM',
      ),
      PackageItem(
        categoryName: 'Wellness',
        subcategoryName: 'Spa',
        placeName: 'Still Water Spa',
        slot: '1:00 - 3:00 PM',
      ),
      PackageItem(
        categoryName: 'Food',
        subcategoryName: 'Ice Cream',
        placeName: 'Melt Studio',
        slot: '4:00 - 5:00 PM',
      ),
      PackageItem(
        categoryName: 'Travel',
        subcategoryName: 'Hotel',
        placeName: 'Harbor Stay',
        slot: '6:00 PM check-in',
      ),
    ],
  ),
];

class StartPage extends StatelessWidget {
  const StartPage({super.key, required this.controller});

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
                colors: [Color(0xFF171214), Color(0xFF3B1E2B), Color(0xFFFF5A4F)],
              ),
            ),
            child: SafeArea(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 22, 22, 28),
                children: [
                  const BrandHeader(onDark: true),
                  const SizedBox(height: 34),
                  Text(
                    'How do you want to gift today?',
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          height: 1.02,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Pick a ready day, build your own experience path, or jump back to the card you are creating.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withValues(alpha: 0.76),
                          height: 1.35,
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
                    onTap: () => push(
                      context,
                      BuilderMenuPage(controller: controller),
                    ),
                  ),
                  const SizedBox(height: 14),
                  StartActionCard(
                    number: '3',
                    title: 'View my gift card',
                    description: '${controller.gifts.length} stops, \$${controller.total} total.',
                    icon: Icons.credit_card,
                    color: violet,
                    onTap: () => push(
                      context,
                      GeneratedCardPage(controller: controller),
                    ),
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

class ReadyPackagesPage extends StatelessWidget {
  const ReadyPackagesPage({super.key, required this.controller});

  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBar(context, 'Ready packages'),
      body: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        itemCount: readyPackages.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final package = readyPackages[index];
          final gifts = package.items.map(packageItemToGift).whereType<PlannedGift>().toList();
          final total = gifts.fold<int>(0, (sum, gift) => sum + gift.place.price);

          return Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                colors: [
                  package.themeColor,
                  ink,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: package.themeColor.withValues(alpha: 0.25),
                  blurRadius: 20,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        package.name,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                    ),
                    Text(
                      '\$$total',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  package.description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.76),
                      ),
                ),
                const SizedBox(height: 16),
                ...gifts.map(
                  (gift) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        Icon(gift.icon, color: Colors.white, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${gift.slot}  ${gift.place.name}',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () {
                    controller.usePackage(package);
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
                    backgroundColor: Colors.white,
                    foregroundColor: ink,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class BuilderMenuPage extends StatelessWidget {
  const BuilderMenuPage({super.key, required this.controller});

  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
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
                      CategoryPage(
                        controller: controller,
                        category: category,
                      ),
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

class CategoryPage extends StatefulWidget {
  const CategoryPage({
    super.key,
    required this.controller,
    required this.category,
  });

  final GiftPlanController controller;
  final GiftCategory category;

  @override
  State<CategoryPage> createState() => _CategoryPageState();
}

class _CategoryPageState extends State<CategoryPage> {
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
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
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
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
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
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
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

class GeneratedCardPage extends StatelessWidget {
  const GeneratedCardPage({super.key, required this.controller});

  final GiftPlanController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return Scaffold(
          appBar: appBar(context, 'Generated card'),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 30),
            children: [
              CreditGiftCard(controller: controller),
              const SizedBox(height: 24),
              Text(
                'Day timeline',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 12),
              DayTimeline(
                gifts: controller.gifts,
                onRemove: controller.removeGift,
              ),
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: controller.gifts.isEmpty ? null : () {},
                icon: const Icon(Icons.shopping_bag),
                label: const Text('Buy this gift card'),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class BrandHeader extends StatelessWidget {
  const BrandHeader({super.key, this.onDark = false});

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
          child: Icon(Icons.card_giftcard, color: onDark ? Colors.white : cream),
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

class StartActionCard extends StatelessWidget {
  const StartActionCard({
    super.key,
    required this.number,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final String number;
  final String title;
  final String description;
  final IconData icon;
  final Color color;
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
              const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}

class GiftSetupPanel extends StatefulWidget {
  const GiftSetupPanel({super.key, required this.controller});

  final GiftPlanController controller;

  @override
  State<GiftSetupPanel> createState() => _GiftSetupPanelState();
}

class _GiftSetupPanelState extends State<GiftSetupPanel> {
  late final TextEditingController recipientController;
  late final TextEditingController noteController;

  @override
  void initState() {
    super.initState();
    recipientController = TextEditingController(
      text: widget.controller.recipient,
    );
    noteController = TextEditingController(
      text: widget.controller.note,
    );
  }

  @override
  void dispose() {
    recipientController.dispose();
    noteController.dispose();
    super.dispose();
  }

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

class CostPulse extends StatelessWidget {
  const CostPulse({super.key, required this.controller});

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

class CategoryButton extends StatelessWidget {
  const CategoryButton({super.key, required this.category, required this.onTap});

  final GiftCategory category;
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
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
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

class PlaceSelectionCard extends StatefulWidget {
  const PlaceSelectionCard({
    super.key,
    required this.controller,
    required this.category,
    required this.subcategory,
    required this.place,
  });

  final GiftPlanController controller;
  final GiftCategory category;
  final GiftSubcategory subcategory;
  final GiftPlace place;

  @override
  State<PlaceSelectionCard> createState() => _PlaceSelectionCardState();
}

class _PlaceSelectionCardState extends State<PlaceSelectionCard> {
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
                    content: Text('${widget.place.name} added for $selectedSlot'),
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

class DayTimeline extends StatelessWidget {
  const DayTimeline({
    super.key,
    required this.gifts,
    required this.onRemove,
  });

  final List<PlannedGift> gifts;
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
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
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

class GenerateBar extends StatelessWidget {
  const GenerateBar({super.key, required this.controller});

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
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CreditGiftCard extends StatelessWidget {
  const CreditGiftCard({super.key, required this.controller});

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
                child: CardMeta(label: 'DATE', value: shortDate(controller.date)),
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

class CardCircles extends StatelessWidget {
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

class CardMeta extends StatelessWidget {
  const CardMeta({super.key, required this.label, required this.value});

  final String label;
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

AppBar appBar(BuildContext context, String title) {
  return AppBar(
    title: Text(title),
    centerTitle: false,
    backgroundColor: cream,
    surfaceTintColor: cream,
  );
}

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

void push(BuildContext context, Widget page) {
  Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => page),
  );
}

PlannedGift? packageItemToGift(PackageItem item) {
  for (final category in categories) {
    if (category.name != item.categoryName) continue;
    for (final subcategory in category.subcategories) {
      if (subcategory.name != item.subcategoryName) continue;
      for (final place in subcategory.places) {
        if (place.name == item.placeName) {
          return PlannedGift(
            category: category.name,
            subcategory: subcategory.name,
            place: place,
            slot: item.slot,
            icon: category.icon,
            color: category.color,
          );
        }
      }
    }
  }
  return null;
}

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

String shortDate(DateTime date) {
  return '${date.month}/${date.day}/${date.year.toString().substring(2)}';
}

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
