import 'package:flutter/material.dart';

import '../models/user.dart';
import '../utils/helpers.dart';

/// Local data service that exposes categories and ready packages.
class ApiService {
  /// Creates the local API service.
  const ApiService();

  /// Returns all available gift categories.
  List<GiftCategory> getCategories() => categories;

  /// Returns all ready-made gift packages.
  List<ReadyPackage> getReadyPackages() => readyPackages;

  /// Resolves a [PackageItem] into a fully planned gift.
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
}

/// Shared instance used by the gift planning controller.
const defaultApiService = ApiService();

/// Coordinates the current gift plan and notifies listening screens.
class GiftPlanController extends ChangeNotifier {
  /// Creates a gift plan controller backed by a local API service.
  GiftPlanController({this.apiService = defaultApiService});

  /// Data provider used to resolve categories and packages.
  final ApiService apiService;

  /// Selected gift delivery date.
  DateTime date = DateTime.now().add(const Duration(days: 7));

  /// Name shown on the generated gift card.
  String recipient = 'Maya';

  /// Personal message shown on the generated gift card.
  String note = 'A whole day of little surprises, planned just for you.';

  /// Gift stops currently selected by the user.
  final List<PlannedGift> gifts = [];

  /// Total price for all planned gifts.
  int get total => gifts.fold(0, (sum, gift) => sum + gift.place.price);

  /// Replaces the selected gift delivery date.
  void updateDate(DateTime value) {
    date = value;
    notifyListeners();
  }

  /// Replaces the selected card recipient name.
  void updateRecipient(String value) {
    recipient = value;
    notifyListeners();
  }

  /// Replaces the selected card note.
  void updateNote(String value) {
    note = value;
    notifyListeners();
  }

  /// Adds a gift stop and keeps the itinerary sorted by time.
  void addGift(PlannedGift gift) {
    gifts.add(gift);
    gifts.sort(
      (a, b) => slotSortValue(a.slot).compareTo(slotSortValue(b.slot)),
    );
    notifyListeners();
  }

  /// Removes a gift stop from the itinerary.
  void removeGift(PlannedGift gift) {
    gifts.remove(gift);
    notifyListeners();
  }

  /// Replaces the current itinerary with a ready package.
  void usePackage(ReadyPackage package) {
    gifts
      ..clear()
      ..addAll(
        package.items
            .map(apiService.packageItemToGift)
            .whereType<PlannedGift>(),
      );
    gifts.sort(
      (a, b) => slotSortValue(a.slot).compareTo(slotSortValue(b.slot)),
    );
    notifyListeners();
  }
}

/// Catalog of all categories and places available in the builder.
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

/// Catalog of ready-made packages users can apply to their plan.
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
