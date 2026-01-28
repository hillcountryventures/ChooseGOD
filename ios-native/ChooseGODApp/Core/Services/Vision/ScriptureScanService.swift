import Foundation
import Vision
import UIKit

/// Verse reference found in scanned text
struct VerseReference: Identifiable, Hashable {
    let id = UUID()
    let fullMatch: String
    let book: String
    let chapter: Int
    let verseStart: Int
    let verseEnd: Int?
    let range: Range<String.Index>
    
    var displayString: String {
        if let end = verseEnd, end != verseStart {
            return "\(book) \(chapter):\(verseStart)-\(end)"
        }
        return "\(book) \(chapter):\(verseStart)"
    }
}

/// Result from OCR scan
struct ScanResult: Identifiable {
    let id = UUID()
    let fullText: String
    let verseReferences: [VerseReference]
    let confidence: Float
    let timestamp: Date
    
    var hasVerseReferences: Bool { !verseReferences.isEmpty }
}

/// OCR processing and verse reference extraction
@MainActor
final class ScriptureScanService: ObservableObject {
    @Published var isProcessing = false
    @Published var lastResult: ScanResult?
    @Published var error: String?
    
    // All 66 books with common abbreviations
    private static let bookPatterns: [(pattern: String, name: String)] = [
        ("Genesis|Gen", "Genesis"), ("Exodus|Exod?", "Exodus"),
        ("Leviticus|Lev", "Leviticus"), ("Numbers|Num", "Numbers"),
        ("Deuteronomy|Deut?", "Deuteronomy"), ("Joshua|Josh?", "Joshua"),
        ("Judges|Judg?", "Judges"), ("Ruth", "Ruth"),
        ("1\\s*Samuel|1\\s*Sam", "1 Samuel"), ("2\\s*Samuel|2\\s*Sam", "2 Samuel"),
        ("1\\s*Kings|1\\s*Ki?n?gs?", "1 Kings"), ("2\\s*Kings|2\\s*Ki?n?gs?", "2 Kings"),
        ("1\\s*Chronicles|1\\s*Chr(?:on)?", "1 Chronicles"), ("2\\s*Chronicles|2\\s*Chr(?:on)?", "2 Chronicles"),
        ("Ezra", "Ezra"), ("Nehemiah|Neh", "Nehemiah"),
        ("Esther|Esth?", "Esther"), ("Job", "Job"),
        ("Psalms?|Ps(?:alm)?", "Psalms"), ("Proverbs|Prov?", "Proverbs"),
        ("Ecclesiastes|Eccl(?:es)?", "Ecclesiastes"), ("Song\\s*of\\s*Solomon|Song|SoS|SS", "Song of Solomon"),
        ("Isaiah|Isa", "Isaiah"), ("Jeremiah|Jer", "Jeremiah"),
        ("Lamentations|Lam", "Lamentations"), ("Ezekiel|Ezek?", "Ezekiel"),
        ("Daniel|Dan", "Daniel"), ("Hosea|Hos", "Hosea"),
        ("Joel", "Joel"), ("Amos", "Amos"),
        ("Obadiah|Obad?", "Obadiah"), ("Jonah|Jon", "Jonah"),
        ("Micah|Mic", "Micah"), ("Nahum|Nah", "Nahum"),
        ("Habakkuk|Hab", "Habakkuk"), ("Zephaniah|Zeph?", "Zephaniah"),
        ("Haggai|Hag", "Haggai"), ("Zechariah|Zech?", "Zechariah"),
        ("Malachi|Mal", "Malachi"),
        ("Matthew|Matt?", "Matthew"), ("Mark|Mk", "Mark"),
        ("Luke|Lk", "Luke"), ("John|Jn", "John"),
        ("Acts", "Acts"), ("Romans|Rom", "Romans"),
        ("1\\s*Corinthians|1\\s*Cor", "1 Corinthians"), ("2\\s*Corinthians|2\\s*Cor", "2 Corinthians"),
        ("Galatians|Gal", "Galatians"), ("Ephesians|Eph", "Ephesians"),
        ("Philippians|Phil", "Philippians"), ("Colossians|Col", "Colossians"),
        ("1\\s*Thessalonians|1\\s*Thess?", "1 Thessalonians"), ("2\\s*Thessalonians|2\\s*Thess?", "2 Thessalonians"),
        ("1\\s*Timothy|1\\s*Tim", "1 Timothy"), ("2\\s*Timothy|2\\s*Tim", "2 Timothy"),
        ("Titus|Tit", "Titus"), ("Philemon|Phlm?", "Philemon"),
        ("Hebrews|Heb", "Hebrews"), ("James|Jas", "James"),
        ("1\\s*Peter|1\\s*Pet?", "1 Peter"), ("2\\s*Peter|2\\s*Pet?", "2 Peter"),
        ("1\\s*John|1\\s*Jn", "1 John"), ("2\\s*John|2\\s*Jn", "2 John"),
        ("3\\s*John|3\\s*Jn", "3 John"), ("Jude", "Jude"),
        ("Revelation|Rev", "Revelation"),
    ]
    
    /// Recognize text from a UIImage using Vision framework
    func recognizeText(from image: UIImage) async -> ScanResult? {
        guard let cgImage = image.cgImage else {
            error = "Invalid image"
            return nil
        }
        
        isProcessing = true
        error = nil
        defer { isProcessing = false }
        
        do {
            let (text, confidence) = try await performOCR(on: cgImage)
            guard !text.isEmpty else {
                error = "No text found in image"
                return nil
            }
            
            let refs = extractVerseReferences(from: text)
            let result = ScanResult(
                fullText: text,
                verseReferences: refs,
                confidence: confidence,
                timestamp: Date()
            )
            lastResult = result
            return result
        } catch {
            self.error = "OCR failed: \(error.localizedDescription)"
            return nil
        }
    }
    
    /// Perform OCR using VNRecognizeTextRequest
    private func performOCR(on image: CGImage) async throws -> (String, Float) {
        try await withCheckedThrowingContinuation { continuation in
            let request = VNRecognizeTextRequest { request, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                
                guard let observations = request.results as? [VNRecognizedTextObservation] else {
                    continuation.resume(returning: ("", 0))
                    return
                }
                
                var lines: [String] = []
                var totalConfidence: Float = 0
                
                for obs in observations {
                    if let candidate = obs.topCandidates(1).first {
                        lines.append(candidate.string)
                        totalConfidence += candidate.confidence
                    }
                }
                
                let avgConfidence = observations.isEmpty ? 0 : totalConfidence / Float(observations.count)
                let fullText = lines.joined(separator: "\n")
                continuation.resume(returning: (fullText, avgConfidence))
            }
            
            request.recognitionLevel = .accurate
            request.usesLanguageCorrection = true
            request.recognitionLanguages = ["en-US"]
            
            let handler = VNImageRequestHandler(cgImage: image, options: [:])
            do {
                try handler.perform([request])
            } catch {
                continuation.resume(throwing: error)
            }
        }
    }
    
    /// Extract Bible verse references from text using regex
    func extractVerseReferences(from text: String) -> [VerseReference] {
        var results: [VerseReference] = []
        
        for (pattern, bookName) in Self.bookPatterns {
            let full = "(?:\\b)(\(pattern))\\.?\\s*(\\d{1,3})\\s*[:\\.](\\d{1,3})(?:\\s*[-–—]\\s*(\\d{1,3}))?"
            guard let regex = try? NSRegularExpression(pattern: full, options: [.caseInsensitive]) else { continue }
            
            let nsText = text as NSString
            let matches = regex.matches(in: text, range: NSRange(location: 0, length: nsText.length))
            
            for match in matches {
                let fullRange = match.range
                let fullMatch = nsText.substring(with: fullRange)
                let chapter = Int(nsText.substring(with: match.range(at: 2))) ?? 0
                let verseStart = Int(nsText.substring(with: match.range(at: 3))) ?? 0
                var verseEnd: Int? = nil
                if match.range(at: 4).location != NSNotFound {
                    verseEnd = Int(nsText.substring(with: match.range(at: 4)))
                }
                
                if let swiftRange = Range(fullRange, in: text) {
                    results.append(VerseReference(
                        fullMatch: fullMatch,
                        book: bookName,
                        chapter: chapter,
                        verseStart: verseStart,
                        verseEnd: verseEnd,
                        range: swiftRange
                    ))
                }
            }
        }
        
        return results.sorted { $0.range.lowerBound < $1.range.lowerBound }
    }
}
