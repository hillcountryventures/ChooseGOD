import SwiftUI
import VisionKit
import Vision

/// Decision #10 depth-of-content moat surfacing — Camera OCR scripture scan.
/// User points the camera at a verse on a wall, in a book, on a screen → app
/// recognizes the reference and navigates to it in the Bible reader.
///
/// Implementation: VisionKit's `DataScannerViewController` for live text
/// recognition, plus a regex parser for scripture references.
///
/// Permission required: NSCameraUsageDescription in Info.plist
/// ("Used to scan Bible verse references from photos and printed materials.")
struct ScriptureScanView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    @State private var detectedRef: ScannedScriptureRef?
    @State private var isSupported: Bool = DataScannerViewController.isSupported
        && DataScannerViewController.isAvailable
    @State private var scannerError: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                if isSupported {
                    ScannerRepresentable(detectedRef: $detectedRef, error: $scannerError)
                        .ignoresSafeArea()
                } else {
                    unsupportedState
                }

                VStack {
                    Spacer()
                    if let ref = detectedRef {
                        detectionCard(ref)
                    } else {
                        instructionPill
                    }
                }
                .padding(.bottom, 40)
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                        .foregroundStyle(.white)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .navigationTitle("Scan a verse")
            .toolbarBackground(.hidden, for: .navigationBar)
            .alert("Scanner unavailable", isPresented: .constant(scannerError != nil)) {
                Button("OK") { dismiss() }
            } message: {
                Text(scannerError ?? "")
            }
            .onAppear {
                MagicMomentsService.shared.capture(.day23_camera_ocr_opened)
            }
        }
    }

    private var instructionPill: some View {
        HStack(spacing: 6) {
            Image(systemName: "viewfinder")
            Text("Point at a verse — e.g. John 3:16")
                .font(.subheadline)
                .bold()
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.ultraThinMaterial.opacity(0.9))
        .clipShape(Capsule())
    }

    private func detectionCard(_ ref: ScannedScriptureRef) -> some View {
        VStack(spacing: 8) {
            Text("Detected")
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.7))
            Text(ref.display)
                .font(.title2)
                .bold()
                .foregroundStyle(.white)
            HStack(spacing: 12) {
                Button {
                    detectedRef = nil
                } label: {
                    Text("Keep scanning")
                        .font(.subheadline)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(.white.opacity(0.18))
                        .clipShape(Capsule())
                }
                Button {
                    openInReader(ref)
                } label: {
                    Text("Open in Bible")
                        .font(.subheadline)
                        .bold()
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Theme.Colors.primary)
                        .clipShape(Capsule())
                }
            }
            .padding(.top, 6)
        }
        .padding(20)
        .background(.black.opacity(0.85))
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .padding(.horizontal, 20)
    }

    private var unsupportedState: some View {
        VStack(spacing: 12) {
            Image(systemName: "camera.fill.badge.ellipsis")
                .font(.system(size: 56))
                .foregroundStyle(.white.opacity(0.6))
            Text("Camera scan isn't available on this device.")
                .font(.headline)
                .foregroundStyle(.white)
            Text("Scripture scan needs a recent iPhone with camera access. iPad and older models can't run live text recognition.")
                .font(.caption)
                .foregroundStyle(.white.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
    }

    private func openInReader(_ ref: ScannedScriptureRef) {
        // Persist into the BibleReader's UserDefaults handoff slot — the
        // reader picks these up on appear.
        UserDefaults.standard.set(ref.book, forKey: "lastReadBook")
        UserDefaults.standard.set(ref.chapter, forKey: "lastReadChapter")
        UserDefaults.standard.set(Date(), forKey: "lastReadDate")
        appState.selectedTab = .bible
        MagicMomentsService.shared.capture(.day23_camera_ocr_completed)
        dismiss()
    }
}

// MARK: - Detected scripture ref

struct ScannedScriptureRef: Equatable {
    let book: String
    let chapter: Int
    let verseStart: Int?
    let verseEnd: Int?

    var display: String {
        if let s = verseStart, let e = verseEnd, e != s {
            return "\(book) \(chapter):\(s)-\(e)"
        } else if let s = verseStart {
            return "\(book) \(chapter):\(s)"
        }
        return "\(book) \(chapter)"
    }
}

// MARK: - VisionKit wrapper

private struct ScannerRepresentable: UIViewControllerRepresentable {
    @Binding var detectedRef: ScannedScriptureRef?
    @Binding var error: String?

    func makeUIViewController(context: Context) -> DataScannerViewController {
        let scanner = DataScannerViewController(
            recognizedDataTypes: [.text()],
            qualityLevel: .accurate,
            recognizesMultipleItems: true,
            isHighFrameRateTrackingEnabled: false,
            isPinchToZoomEnabled: true,
            isGuidanceEnabled: true,
            isHighlightingEnabled: true
        )
        scanner.delegate = context.coordinator
        do {
            try scanner.startScanning()
        } catch {
            self.error = "Couldn't start the camera. Please check Settings → Privacy → Camera."
        }
        return scanner
    }

    func updateUIViewController(_ controller: DataScannerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    final class Coordinator: NSObject, DataScannerViewControllerDelegate {
        let parent: ScannerRepresentable
        init(parent: ScannerRepresentable) { self.parent = parent }

        func dataScanner(_ dataScanner: DataScannerViewController,
                         didAdd addedItems: [RecognizedItem],
                         allItems: [RecognizedItem]) {
            for item in addedItems {
                if case .text(let text) = item {
                    if let ref = ScannedScriptureRefParser.parse(text.transcript) {
                        DispatchQueue.main.async {
                            if self.parent.detectedRef != ref {
                                self.parent.detectedRef = ref
                                UINotificationFeedbackGenerator().notificationOccurred(.success)
                            }
                        }
                        return
                    }
                }
            }
        }
    }
}

// MARK: - Reference parser

enum ScannedScriptureRefParser {
    /// Canonical list of book names + multi-word variants. Sorted longest-first
    /// at parse time so "1 John" matches before "John".
    private static let books: [String] = [
        // OT
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
        "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
        "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
        "Ezra", "Nehemiah", "Esther", "Job", "Psalm", "Psalms",
        "Proverbs", "Ecclesiastes", "Song of Solomon", "Song of Songs",
        "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
        "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
        "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
        // NT
        "Matthew", "Mark", "Luke", "John", "Acts",
        "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
        "Ephesians", "Philippians", "Colossians",
        "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
        "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
        "1 John", "2 John", "3 John", "Jude", "Revelation"
    ]

    static func parse(_ raw: String) -> ScannedScriptureRef? {
        let sorted = books.sorted { $0.count > $1.count }
        let bookAlt = sorted
            .map { NSRegularExpression.escapedPattern(for: $0) }
            .joined(separator: "|")

        let pattern = #"\b(\#(bookAlt))\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?\b"#
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else {
            return nil
        }
        let range = NSRange(raw.startIndex..., in: raw)
        guard let match = regex.firstMatch(in: raw, options: [], range: range) else {
            return nil
        }

        func substring(_ idx: Int) -> String? {
            guard idx < match.numberOfRanges,
                  let r = Range(match.range(at: idx), in: raw) else { return nil }
            return String(raw[r])
        }

        guard let bookRaw = substring(1),
              let chapterRaw = substring(2),
              let chapter = Int(chapterRaw) else { return nil }

        let canonicalBook = sorted.first {
            $0.compare(bookRaw, options: .caseInsensitive) == .orderedSame
        } ?? bookRaw

        let book = canonicalBook == "Psalms" ? "Psalm" : canonicalBook

        let verseStart = substring(3).flatMap { Int($0) }
        let verseEnd = substring(4).flatMap { Int($0) }

        return ScannedScriptureRef(
            book: book,
            chapter: chapter,
            verseStart: verseStart,
            verseEnd: verseEnd
        )
    }
}

#Preview {
    ScriptureScanView()
        .environment(AppState.preview)
}
