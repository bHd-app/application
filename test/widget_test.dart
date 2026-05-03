// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:realtime_app/main.dart';

void main() {
  testWidgets('Start page shows gift choices', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());

    expect(
      find.text('Choose the experience you want to gift.'),
      findsOneWidget,
    );
    expect(find.text('See ready experiences'), findsOneWidget);
    expect(find.text('Build it myself'), findsOneWidget);
    expect(find.text('View my gift card'), findsOneWidget);
  });
}
