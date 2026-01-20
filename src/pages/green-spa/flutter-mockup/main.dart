// The Green Spa - Office Tablet App
// Flutter Mockup for Session Management
//
// Screens:
// 1. ScanScreen - Scan QR code from POS
// 2. SessionDetailScreen - Show session info after scan
// 3. BodyPreferenceScreen - Customer fills body preferences
// 4. TimerSessionScreen - Countdown timer during session
//
// Run: flutter run -d chrome --web-renderer html

import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';

void main() {
  runApp(const GreenSpaOfficeApp());
}

// ============================================
// APP & THEME
// ============================================

class GreenSpaOfficeApp extends StatelessWidget {
  const GreenSpaOfficeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'The Green Spa - Office',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'PlusJakartaSans',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF059669),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF1F5F9),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF0F172A),
          elevation: 0,
          centerTitle: true,
        ),
        cardTheme: CardTheme(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF059669),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
      home: const ScanScreen(),
    );
  }
}

// Color constants
class AppColors {
  static const spaGreen = Color(0xFF059669);
  static const spaGreenLight = Color(0xFF10B981);
  static const spaGreenBg = Color(0xFFECFDF5);
  static const spaGreenBorder = Color(0xFFA7F3D0);
  
  static const textPrimary = Color(0xFF0F172A);
  static const textSecondary = Color(0xFF475569);
  static const textMuted = Color(0xFF94A3B8);
  
  static const bgMain = Color(0xFFF1F5F9);
  static const bgCard = Colors.white;
  static const borderColor = Color(0xFFE2E8F0);
  
  static const accentRed = Color(0xFFEF4444);
  static const accentRedLight = Color(0xFFFEE2E2);
  static const accentBlue = Color(0xFF3B82F6);
  static const accentBlueLight = Color(0xFFDBEAFE);
  static const accentPurple = Color(0xFF8B5CF6);
  static const accentPurpleLight = Color(0xFFEDE9FE);
  static const accentOrange = Color(0xFFF97316);
  static const accentOrangeLight = Color(0xFFFFEDD5);
  static const accentYellow = Color(0xFFEAB308);
  static const accentYellowLight = Color(0xFFFEF9C3);
}

// ============================================
// MODELS
// ============================================

class SessionData {
  final String sessionCode;
  final String memberName;
  final String memberPhone;
  final String serviceName;
  final int durationMinutes;
  final String therapistName;
  final String roomName;
  final DateTime scheduledTime;
  final List<String> existingBodyPreferences;

  SessionData({
    required this.sessionCode,
    required this.memberName,
    required this.memberPhone,
    required this.serviceName,
    required this.durationMinutes,
    required this.therapistName,
    required this.roomName,
    required this.scheduledTime,
    this.existingBodyPreferences = const [],
  });
}

// Mock data
final mockSession = SessionData(
  sessionCode: 'GS-20250117-A1B2',
  memberName: 'Sarah Wijaya',
  memberPhone: '0812-3456-7890',
  serviceName: 'Traditional Massage',
  durationMinutes: 60,
  therapistName: 'Maya Putri',
  roomName: 'Room 3 - Jasmine',
  scheduledTime: DateTime.now().add(const Duration(minutes: 5)),
  existingBodyPreferences: ['Leher', 'Pinggang Bawah'],
);

// ============================================
// SCREEN 1: SCAN SCREEN
// ============================================

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  final TextEditingController _codeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  void _simulateScan() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SessionDetailScreen(session: mockSession),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  bottom: BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF10B981), Color(0xFF059669)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.spaGreen.withOpacity(0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.spa, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        text: const TextSpan(
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                          children: [
                            TextSpan(text: 'The '),
                            TextSpan(
                              text: 'Green',
                              style: TextStyle(color: AppColors.spaGreen),
                            ),
                            TextSpan(text: ' Spa'),
                          ],
                        ),
                      ),
                      const Text(
                        'Office Tablet',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.spaGreenBg,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.spaGreenBorder),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.spaGreen,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Ready',
                          style: TextStyle(
                            color: AppColors.spaGreen,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Main Content
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Scan Session QR Code',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Arahkan kamera ke QR code yang ditampilkan di POS',
                        style: TextStyle(
                          fontSize: 16,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 48),

                      // QR Scanner Area
                      ScaleTransition(
                        scale: _animation,
                        child: GestureDetector(
                          onTap: _simulateScan,
                          child: Container(
                            width: 300,
                            height: 300,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(
                                color: AppColors.borderColor,
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 20,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Stack(
                              children: [
                                Center(
                                  child: Icon(
                                    Icons.qr_code_scanner,
                                    size: 120,
                                    color: AppColors.textMuted.withOpacity(0.5),
                                  ),
                                ),
                                // Corner borders
                                Positioned(
                                  top: 20,
                                  left: 20,
                                  child: _buildCorner(true, true),
                                ),
                                Positioned(
                                  top: 20,
                                  right: 20,
                                  child: _buildCorner(true, false),
                                ),
                                Positioned(
                                  bottom: 20,
                                  left: 20,
                                  child: _buildCorner(false, true),
                                ),
                                Positioned(
                                  bottom: 20,
                                  right: 20,
                                  child: _buildCorner(false, false),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 32),
                      const Text(
                        'Tap untuk simulasi scan',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textMuted,
                          fontStyle: FontStyle.italic,
                        ),
                      ),

                      const SizedBox(height: 48),

                      // Divider
                      Row(
                        children: [
                          const Expanded(child: Divider()),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              'atau masukkan kode manual',
                              style: TextStyle(
                                color: AppColors.textMuted,
                                fontSize: 14,
                              ),
                            ),
                          ),
                          const Expanded(child: Divider()),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Manual Input
                      SizedBox(
                        width: 400,
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _codeController,
                                decoration: InputDecoration(
                                  hintText: 'GS-XXXXXXXX-XXXX',
                                  hintStyle: const TextStyle(color: AppColors.textMuted),
                                  filled: true,
                                  fillColor: Colors.white,
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: AppColors.borderColor),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: AppColors.borderColor),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: AppColors.spaGreen, width: 2),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 20,
                                    vertical: 16,
                                  ),
                                ),
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 2,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            ElevatedButton(
                              onPressed: _simulateScan,
                              child: const Text('Cari'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Footer with recent sessions
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  top: BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Sesi Hari Ini',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildRecentSession('Sarah W.', 'Traditional', 'Maya', 'In Progress', AppColors.spaGreen),
                      const SizedBox(width: 16),
                      _buildRecentSession('Budi S.', 'Hot Stone', 'Dewi', 'Waiting', AppColors.accentOrange),
                      const SizedBox(width: 16),
                      _buildRecentSession('Rina K.', 'Facial', 'Nia', 'Completed', AppColors.textMuted),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCorner(bool isTop, bool isLeft) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        border: Border(
          top: isTop ? const BorderSide(color: AppColors.spaGreen, width: 4) : BorderSide.none,
          bottom: !isTop ? const BorderSide(color: AppColors.spaGreen, width: 4) : BorderSide.none,
          left: isLeft ? const BorderSide(color: AppColors.spaGreen, width: 4) : BorderSide.none,
          right: !isLeft ? const BorderSide(color: AppColors.spaGreen, width: 4) : BorderSide.none,
        ),
        borderRadius: BorderRadius.only(
          topLeft: isTop && isLeft ? const Radius.circular(8) : Radius.zero,
          topRight: isTop && !isLeft ? const Radius.circular(8) : Radius.zero,
          bottomLeft: !isTop && isLeft ? const Radius.circular(8) : Radius.zero,
          bottomRight: !isTop && !isLeft ? const Radius.circular(8) : Radius.zero,
        ),
      ),
    );
  }

  Widget _buildRecentSession(String name, String service, String therapist, String status, Color statusColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgMain,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.spaGreenBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  name.split(' ').map((e) => e[0]).take(2).join(),
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.spaGreen,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    '$service • $therapist',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                status,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: statusColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================
// SCREEN 2: SESSION DETAIL
// ============================================

class SessionDetailScreen extends StatelessWidget {
  final SessionData session;

  const SessionDetailScreen({super.key, required this.session});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Sesi'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: Column(
              children: [
                // Success Banner
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF10B981), Color(0xFF059669)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.spaGreen.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(
                          Icons.check_circle,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Sesi Ditemukan!',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Kode: ${session.sessionCode}',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white.withOpacity(0.9),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Member Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.borderColor),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF10B981), Color(0xFF059669)],
                              ),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Center(
                              child: Text(
                                session.memberName.split(' ').map((e) => e[0]).take(2).join(),
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 20),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  session.memberName,
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.phone, size: 16, color: AppColors.textMuted),
                                    const SizedBox(width: 6),
                                    Text(
                                      session.memberPhone,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: AppColors.accentBlueLight,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.card_membership, size: 16, color: AppColors.accentBlue),
                                SizedBox(width: 6),
                                Text(
                                  'Member',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.accentBlue,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 24),
                      
                      // Session Details Grid
                      Row(
                        children: [
                          Expanded(
                            child: _buildDetailItem(
                              Icons.spa,
                              'Layanan',
                              session.serviceName,
                              AppColors.accentPurple,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildDetailItem(
                              Icons.timer,
                              'Durasi',
                              '${session.durationMinutes} Menit',
                              AppColors.accentOrange,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: _buildDetailItem(
                              Icons.person,
                              'Therapist',
                              session.therapistName,
                              AppColors.spaGreen,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildDetailItem(
                              Icons.door_front_door,
                              'Ruangan',
                              session.roomName,
                              AppColors.accentBlue,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Existing Body Preferences
                if (session.existingBodyPreferences.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.accentRedLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFFECACA)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.warning_amber_rounded, color: AppColors.accentRed),
                            SizedBox(width: 8),
                            Text(
                              'AREA HINDARI PIJAT',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accentRed,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: session.existingBodyPreferences.map((area) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.close, size: 16, color: AppColors.accentRed),
                                  const SizedBox(width: 6),
                                  Text(
                                    area,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.accentRed,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Actions
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => BodyPreferenceScreen(session: session),
                            ),
                          );
                        },
                        icon: const Icon(Icons.edit_note),
                        label: const Text('Update Preferensi'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.spaGreen,
                          side: const BorderSide(color: AppColors.spaGreen, width: 2),
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => TimerSessionScreen(session: session),
                            ),
                          );
                        },
                        icon: const Icon(Icons.play_arrow),
                        label: const Text('Mulai Sesi'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          textStyle: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailItem(IconData icon, String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================
// SCREEN 3: BODY PREFERENCE
// ============================================

class BodyPreferenceScreen extends StatefulWidget {
  final SessionData session;

  const BodyPreferenceScreen({super.key, required this.session});

  @override
  State<BodyPreferenceScreen> createState() => _BodyPreferenceScreenState();
}

class _BodyPreferenceScreenState extends State<BodyPreferenceScreen> {
  final Set<String> _selectedAreas = {};

  final List<Map<String, dynamic>> bodyAreas = [
    {'id': 'head', 'name': 'Kepala', 'icon': Icons.face},
    {'id': 'neck', 'name': 'Leher', 'icon': Icons.accessibility_new},
    {'id': 'shoulder_left', 'name': 'Bahu Kiri', 'icon': Icons.arrow_back},
    {'id': 'shoulder_right', 'name': 'Bahu Kanan', 'icon': Icons.arrow_forward},
    {'id': 'upper_back', 'name': 'Punggung Atas', 'icon': Icons.vertical_align_top},
    {'id': 'lower_back', 'name': 'Punggung Bawah', 'icon': Icons.vertical_align_bottom},
    {'id': 'waist', 'name': 'Pinggang', 'icon': Icons.sync_alt},
    {'id': 'arm_left', 'name': 'Lengan Kiri', 'icon': Icons.pan_tool},
    {'id': 'arm_right', 'name': 'Lengan Kanan', 'icon': Icons.pan_tool},
    {'id': 'leg_left', 'name': 'Kaki Kiri', 'icon': Icons.directions_walk},
    {'id': 'leg_right', 'name': 'Kaki Kanan', 'icon': Icons.directions_walk},
    {'id': 'knee_left', 'name': 'Lutut Kiri', 'icon': Icons.radio_button_checked},
    {'id': 'knee_right', 'name': 'Lutut Kanan', 'icon': Icons.radio_button_checked},
    {'id': 'foot_left', 'name': 'Telapak Kaki Kiri', 'icon': Icons.skateboarding},
    {'id': 'foot_right', 'name': 'Telapak Kaki Kanan', 'icon': Icons.skateboarding},
  ];

  @override
  void initState() {
    super.initState();
    // Pre-select existing preferences
    for (var pref in widget.session.existingBodyPreferences) {
      final area = bodyAreas.firstWhere(
        (a) => a['name'] == pref,
        orElse: () => {},
      );
      if (area.isNotEmpty) {
        _selectedAreas.add(area['id']);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Preferensi Tubuh'),
        actions: [
          TextButton.icon(
            onPressed: () {
              setState(() => _selectedAreas.clear());
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Reset'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Header Info
          Container(
            padding: const EdgeInsets.all(20),
            margin: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.accentRedLight,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFFECACA)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  color: AppColors.accentRed,
                  size: 28,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Pilih Area yang Perlu Dihindari',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accentRed,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Tap pada bagian tubuh yang tidak boleh dipijat',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.accentRed.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Member Info Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            color: Colors.white,
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.spaGreenBg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      widget.session.memberName.split(' ').map((e) => e[0]).take(2).join(),
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppColors.spaGreen,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.session.memberName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        widget.session.serviceName,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _selectedAreas.isEmpty 
                        ? AppColors.spaGreenBg 
                        : AppColors.accentRedLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_selectedAreas.length} area dipilih',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: _selectedAreas.isEmpty 
                          ? AppColors.spaGreen 
                          : AppColors.accentRed,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Body Areas Grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(24),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 1.2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: bodyAreas.length,
              itemBuilder: (context, index) {
                final area = bodyAreas[index];
                final isSelected = _selectedAreas.contains(area['id']);
                
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _selectedAreas.remove(area['id']);
                      } else {
                        _selectedAreas.add(area['id']);
                      }
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.accentRedLight : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? AppColors.accentRed : AppColors.borderColor,
                        width: isSelected ? 2 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: AppColors.accentRed.withOpacity(0.2),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          area['icon'],
                          size: 36,
                          color: isSelected ? AppColors.accentRed : AppColors.textMuted,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          area['name'],
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? AppColors.accentRed : AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        if (isSelected) ...[
                          const SizedBox(height: 4),
                          const Icon(
                            Icons.close,
                            size: 16,
                            color: AppColors.accentRed,
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Bottom Actions
          Container(
            padding: const EdgeInsets.all(24),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.borderColor)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('Batal'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // Save and go back
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            _selectedAreas.isEmpty
                                ? 'Preferensi dihapus'
                                : '${_selectedAreas.length} area ditandai untuk dihindari',
                          ),
                          backgroundColor: AppColors.spaGreen,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      );
                      Navigator.pop(context);
                    },
                    icon: const Icon(Icons.check),
                    label: const Text('Simpan Preferensi'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 18),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================
// SCREEN 4: TIMER SESSION
// ============================================

class TimerSessionScreen extends StatefulWidget {
  final SessionData session;

  const TimerSessionScreen({super.key, required this.session});

  @override
  State<TimerSessionScreen> createState() => _TimerSessionScreenState();
}

class _TimerSessionScreenState extends State<TimerSessionScreen> {
  late int _remainingSeconds;
  Timer? _timer;
  bool _isRunning = false;
  bool _isPaused = false;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.session.durationMinutes * 60;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    setState(() {
      _isRunning = true;
      _isPaused = false;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        _timer?.cancel();
        _showCompletionDialog();
      }
    });
  }

  void _pauseTimer() {
    setState(() => _isPaused = true);
    _timer?.cancel();
  }

  void _resumeTimer() {
    _startTimer();
  }

  void _endSession() {
    _timer?.cancel();
    _showCompletionDialog();
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.spaGreenBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle,
                color: AppColors.spaGreen,
                size: 48,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Sesi Selesai!',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${widget.session.memberName} telah menyelesaikan sesi ${widget.session.serviceName}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textMuted),
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              child: const Text('Kembali ke Beranda'),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  double get _progress => 1 - (_remainingSeconds / (widget.session.durationMinutes * 60));

  @override
  Widget build(BuildContext context) {
    final isLowTime = _remainingSeconds <= 300; // 5 minutes
    final timerColor = isLowTime ? AppColors.accentRed : AppColors.spaGreen;

    return Scaffold(
      backgroundColor: _isRunning && !_isPaused 
          ? (isLowTime ? const Color(0xFFFEF2F2) : AppColors.spaGreenBg)
          : AppColors.bgMain,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Sesi Berlangsung'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_isRunning) {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Keluar dari Sesi?'),
                  content: const Text('Timer akan tetap berjalan di background.'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Batal'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.pop(context);
                      },
                      child: const Text('Keluar'),
                    ),
                  ],
                ),
              );
            } else {
              Navigator.pop(context);
            }
          },
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Session Info Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF10B981), Color(0xFF059669)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(
                          widget.session.memberName.split(' ').map((e) => e[0]).take(2).join(),
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.session.memberName,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${widget.session.serviceName} • ${widget.session.therapistName}',
                          style: const TextStyle(
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 40),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: _isRunning && !_isPaused
                            ? AppColors.spaGreenBg
                            : (_isPaused ? AppColors.accentOrangeLight : AppColors.bgMain),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _isRunning && !_isPaused
                                  ? AppColors.spaGreen
                                  : (_isPaused ? AppColors.accentOrange : AppColors.textMuted),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _isRunning && !_isPaused
                                ? 'Berjalan'
                                : (_isPaused ? 'Pause' : 'Menunggu'),
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: _isRunning && !_isPaused
                                  ? AppColors.spaGreen
                                  : (_isPaused ? AppColors.accentOrange : AppColors.textMuted),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 60),

              // Timer Circle
              SizedBox(
                width: 320,
                height: 320,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Background Circle
                    Container(
                      width: 320,
                      height: 320,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: timerColor.withOpacity(0.2),
                            blurRadius: 40,
                            spreadRadius: 10,
                          ),
                        ],
                      ),
                    ),
                    // Progress Circle
                    SizedBox(
                      width: 300,
                      height: 300,
                      child: CircularProgressIndicator(
                        value: _progress,
                        strokeWidth: 12,
                        backgroundColor: AppColors.borderColor,
                        valueColor: AlwaysStoppedAnimation<Color>(timerColor),
                        strokeCap: StrokeCap.round,
                      ),
                    ),
                    // Timer Text
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _formatTime(_remainingSeconds),
                          style: TextStyle(
                            fontSize: 72,
                            fontWeight: FontWeight.w800,
                            color: timerColor,
                            fontFeatures: const [FontFeature.tabularFigures()],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _isRunning ? 'Sisa Waktu' : 'Durasi Sesi',
                          style: const TextStyle(
                            fontSize: 18,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 60),

              // Control Buttons
              if (!_isRunning) ...[
                SizedBox(
                  width: 300,
                  child: ElevatedButton.icon(
                    onPressed: _startTimer,
                    icon: const Icon(Icons.play_arrow, size: 28),
                    label: const Text('Mulai Sesi'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      textStyle: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ] else ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_isPaused) ...[
                      ElevatedButton.icon(
                        onPressed: _resumeTimer,
                        icon: const Icon(Icons.play_arrow),
                        label: const Text('Lanjutkan'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        ),
                      ),
                    ] else ...[
                      OutlinedButton.icon(
                        onPressed: _pauseTimer,
                        icon: const Icon(Icons.pause),
                        label: const Text('Pause'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.accentOrange,
                          side: const BorderSide(color: AppColors.accentOrange, width: 2),
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        ),
                      ),
                    ],
                    const SizedBox(width: 16),
                    ElevatedButton.icon(
                      onPressed: _endSession,
                      icon: const Icon(Icons.stop),
                      label: const Text('Selesai'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentRed,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      ),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 40),

              // Body Preference Reminder
              if (widget.session.existingBodyPreferences.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.accentRedLight),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.warning_amber, color: AppColors.accentRed),
                      const SizedBox(width: 12),
                      const Text(
                        'Hindari: ',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.accentRed,
                        ),
                      ),
                      Text(
                        widget.session.existingBodyPreferences.join(', '),
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
