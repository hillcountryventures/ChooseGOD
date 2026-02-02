import SwiftUI
import UIKit

/// Renders a VerseShareCardView to a UIImage
@MainActor
final class ShareCardGenerator {
    
    static let shared = ShareCardGenerator()
    private init() {}
    
    /// Generate a share card image
    func generateImage(
        verseText: String,
        reference: String,
        template: ShareCardTemplate,
        cardSize: ShareCardSize
    ) -> UIImage? {
        let view = VerseShareCardView(
            verseText: verseText,
            reference: reference,
            template: template,
            cardSize: cardSize
        )
        
        let renderer = ImageRenderer(content: view)
        renderer.scale = 1.0  // Already at pixel dimensions
        renderer.proposedSize = .init(cardSize.size)
        
        return renderer.uiImage
    }
    
    /// Generate and return as shareable data
    func generatePNGData(
        verseText: String,
        reference: String,
        template: ShareCardTemplate,
        cardSize: ShareCardSize
    ) -> Data? {
        generateImage(
            verseText: verseText,
            reference: reference,
            template: template,
            cardSize: cardSize
        )?.pngData()
    }
    
    /// Save to temp file and return URL (for sharing)
    func generateTempFileURL(
        verseText: String,
        reference: String,
        template: ShareCardTemplate,
        cardSize: ShareCardSize
    ) -> URL? {
        guard let data = generatePNGData(
            verseText: verseText,
            reference: reference,
            template: template,
            cardSize: cardSize
        ) else { return nil }
        
        let fileName = "ChooseGOD_\(reference.replacingOccurrences(of: " ", with: "_")).png"
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
        
        do {
            try data.write(to: url)
            return url
        } catch {
            AppLogger.subscription.error("Failed to write share card: \(error)")
            return nil
        }
    }
}
