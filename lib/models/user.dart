import 'package:flutter/material.dart';

/// Represents one top-level gift category shown in the builder.
class GiftCategory {
  /// Creates an immutable gift category.
  const GiftCategory({
    required this.name,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.subcategories,
  });

  /// Display name for the category.
  final String name;

  /// Short helper text that describes the available category choices.
  final String subtitle;

  /// Icon shown in category buttons and planned gift timeline rows.
  final IconData icon;

  /// Accent color used for the category across the UI.
  final Color color;

  /// Selectable child groups that belong to this category.
  final List<GiftSubcategory> subcategories;
}

/// Groups related gift places under a category.
class GiftSubcategory {
  /// Creates an immutable gift subcategory.
  const GiftSubcategory({required this.name, required this.places});

  /// Display name for the subcategory.
  final String name;

  /// Places that can be booked for this subcategory.
  final List<GiftPlace> places;
}

/// Describes a bookable place or experience.
class GiftPlace {
  /// Creates an immutable gift place.
  const GiftPlace({
    required this.name,
    required this.description,
    required this.price,
    required this.rating,
    required this.slots,
  });

  /// Display name for the place.
  final String name;

  /// Marketing description shown on selection cards.
  final String description;

  /// Price in whole dollars.
  final int price;

  /// User-facing rating value for the place.
  final double rating;

  /// Time slots available for this place.
  final List<String> slots;
}

/// A selected gift stop that appears in the planned day timeline.
class PlannedGift {
  /// Creates an immutable planned gift.
  const PlannedGift({
    required this.category,
    required this.subcategory,
    required this.place,
    required this.slot,
    required this.icon,
    required this.color,
  });

  /// Name of the selected top-level category.
  final String category;

  /// Name of the selected subcategory.
  final String subcategory;

  /// Place selected for this planned stop.
  final GiftPlace place;

  /// Selected visit or booking time.
  final String slot;

  /// Icon inherited from the selected category.
  final IconData icon;

  /// Accent color inherited from the selected category.
  final Color color;
}

/// Describes a ready-made group of planned gift stops.
class ReadyPackage {
  /// Creates an immutable ready package.
  const ReadyPackage({
    required this.name,
    required this.description,
    required this.themeColor,
    required this.items,
  });

  /// Display name for the package.
  final String name;

  /// Short summary of the package itinerary.
  final String description;

  /// Primary color used when rendering the package card.
  final Color themeColor;

  /// Package items that can be resolved into [PlannedGift] values.
  final List<PackageItem> items;
}

/// Lightweight reference to a gift that belongs to a ready package.
class PackageItem {
  /// Creates an immutable package item reference.
  const PackageItem({
    required this.categoryName,
    required this.subcategoryName,
    required this.placeName,
    required this.slot,
  });

  /// Category name used to find the referenced place.
  final String categoryName;

  /// Subcategory name used to find the referenced place.
  final String subcategoryName;

  /// Place name used to find the referenced place.
  final String placeName;

  /// Selected time slot for the package stop.
  final String slot;
}
