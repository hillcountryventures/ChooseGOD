import Foundation
import os

// MARK: - Protocol

protocol HebcalServiceProtocol {
    func getHebrewDate(for gregorianDate: Date) async -> HebrewDate?
    func getTorahPortion(for date: Date) async -> TorahPortion?
    func getTodaysHebrewInfo() async -> (date: HebrewDate?, torah: TorahPortion?)?
}

// MARK: - Implementation

final class HebcalService: HebcalServiceProtocol {
    static let shared = HebcalService()

    private let logger = Logger(subsystem: "com.choosegod.hebcal", category: "service")
    private let baseURL = "https://www.hebcal.com/api/v1"
    private let cache = NSCache<NSString, CachedHebrewData>()

    private init() {}

    // MARK: - Parasha Descriptions (all 54 Torah portions)

    private static let parashaDescriptions: [String: String] = [
        "Parashat Bereishit": "Creation of the world, Adam and Eve, Cain and Abel",
        "Parashat Noach": "Noah builds the ark, the great flood, and God's covenant",
        "Parashat Lech-Lecha": "God calls Abram to leave Haran and journey to Canaan",
        "Parashat Vayera": "Abraham hosts angels, Sodom's destruction, Isaac's birth",
        "Parashat Chayei Sarah": "Sarah's death, Rebecca chosen as Isaac's wife",
        "Parashat Toldot": "Isaac's twins Jacob and Esau, birthright and blessing",
        "Parashat Vayetzei": "Jacob flees to Haran, marries Leah and Rachel, has many children",
        "Parashat Vayishlach": "Jacob wrestles with an angel, reconciles with Esau",
        "Parashat Vayeshev": "Joseph's dreams, sold by brothers, Potiphar's house, prison",
        "Parashat Miketz": "Pharaoh's dreams, Joseph interprets them, becomes vizier",
        "Parashat Vayigash": "Joseph reveals himself to his brothers, family reunites in Egypt",
        "Parashat Vayechi": "Jacob blesses his sons and Joseph, dies in Egypt",
        "Parashat Shemot": "Birth of Moses, burning bush, plagues begin",
        "Parashat Va'eira": "More plagues, God hardens Pharaoh's heart",
        "Parashat Bo": "Final plagues, Passover commandment, departure from Egypt",
        "Parashat Beshalach": "Splitting the Red Sea, Manna and water in the desert",
        "Parashat Yitro": "Jethro visits, Ten Commandments given at Sinai",
        "Parashat Mishpatim": "Civil laws, Hebrew servants, murder, theft, slavery laws",
        "Parashat Terumah": "God requests tabernacle materials and offerings",
        "Parashat Tetzaveh": "Aaron's priestly garments, menorah, and altar of incense",
        "Parashat Ki Tisa": "Census, bronze basin, incense recipe, golden calf sin",
        "Parashat Vayakhel": "Tabernacle construction begins, Shabbat reminder",
        "Parashat Pekudei": "Completion of tabernacle, accounting of materials",
        "Parashat Vayikra": "Laws of sacrifices, burnt offerings, grain offerings",
        "Parashat Tzav": "Instructions to Aaron about sacrificial offerings",
        "Parashat Shemini": "Aaron's sons Nadab and Abihu die, laws of kosher animals",
        "Parashat Tazria": "Laws of impurity after childbirth, skin diseases",
        "Parashat Metzora": "Purification laws for skin diseases and contamination",
        "Parashat Achrei Mot": "Yom Kippur service, prohibitions, Day of Atonement",
        "Parashat Kedoshim": "Laws of holiness, love neighbor as yourself",
        "Parashat Emor": "Priestly purity laws, holy days, showbread, menorah",
        "Parashat Behar": "Jubilee year, land laws, Hebrew slaves",
        "Parashat Bechukotai": "Blessings for obedience, curses for disobedience",
        "Parashat Bamidbar": "Census of Israel, Levite duties, camp arrangement",
        "Parashat Naso": "Continuation of census, Levite assignments, priestly blessings",
        "Parashat Behaalotcha": "Menorah lighting, Passover, cloud over tabernacle",
        "Parashat Shlach": "Twelve spies sent to Canaan, rebellion and wilderness",
        "Parashat Korach": "Korach's rebellion against Moses, God's judgment",
        "Parashat Chukat": "Red heifer, water from rock, Aaron's death",
        "Parashat Balak": "Balak hires Balaam to curse Israel, Balaam's blessings",
        "Parashat Pinchas": "Pinchas's zealous act, daughters of Zelophehad",
        "Parashat Matot": "Vows made by men and women, war against Midian",
        "Parashat Masei": "Journey stages in the desert, division of Canaan",
        "Parashat Devarim": "Moses reviews Israel's wilderness journey and God's laws",
        "Parashat Va'etchanan": "Moses pleads to enter Canaan, Shema Israel prayer",
        "Parashat Ekev": "Blessings for obedience, warning against forgetting God",
        "Parashat Re'eh": "Choosing blessing or curse, idolatry warning",
        "Parashat Shoftim": "Judges, king laws, cities of refuge, war rules",
        "Parashat Ki Tetze": "Laws of vows, divorce, firstborn rights, stoning",
        "Parashat Ki Tavo": "First fruits offering, tithes, covenant renewal",
        "Parashat Netzavim": "Standing before the Lord, repentance and return",
        "Parashat Vayelech": "Moses' final charge, writing Torah, final blessing",
        "Parashat Ha'azinu": "Song of Moses, God's faithfulness and judgment",
        "Parashat V'Zot HaBracha": "Moses' final blessings to the tribes, his death"
    ]

    // MARK: - Public API

    func getHebrewDate(for gregorianDate: Date) async -> HebrewDate? {
        let cacheKey = cacheKey(for: gregorianDate, prefix: "hebrew_date")

        if let cached = cache.object(forKey: cacheKey as NSString) {
            return cached.hebrewDate
        }

        guard let hebrewDate = await fetchHebrewDate(for: gregorianDate) else {
            return nil
        }

        let cached = CachedHebrewData(hebrewDate: hebrewDate)
        cache.setObject(cached, forKey: cacheKey as NSString, cost: 1)

        return hebrewDate
    }

    func getTorahPortion(for date: Date) async -> TorahPortion? {
        let cacheKey = cacheKey(for: date, prefix: "torah_portion")

        if let cached = cache.object(forKey: cacheKey as NSString) {
            return cached.torahPortion
        }

        guard let torah = await fetchTorahPortion(for: date) else {
            return nil
        }

        let cached = CachedHebrewData(torahPortion: torah)
        cache.setObject(cached, forKey: cacheKey as NSString, cost: 1)

        return torah
    }

    func getTodaysHebrewInfo() async -> (date: HebrewDate?, torah: TorahPortion?)? {
        let today = Date()
        let hebrewDate = await getHebrewDate(for: today)
        let torah = await getTorahPortion(for: today)

        return (hebrewDate, torah)
    }

    // MARK: - Private Helpers

    private func fetchHebrewDate(for gregorianDate: Date) async -> HebrewDate? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateString = formatter.string(from: gregorianDate)

        let urlString = "\(baseURL)/hebrew?cfg=json&date=\(dateString)"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Hebrew date URL")
            return nil
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoder = JSONDecoder()

            if let response = try? decoder.decode(HebcalResponse.self, from: data) {
                let components = response.hebrew.split(separator: " ").map(String.init)
                guard components.count >= 3 else { return nil }

                let day = Int(components[0]) ?? 1
                let monthStr = components[1]
                let year = Int(components[2]) ?? 5000

                let monthMap: [String: Int] = [
                    "Tevet": 10, "Shevat": 11, "Adar": 12, "Nisan": 1,
                    "Iyar": 2, "Sivan": 3, "Tammuz": 4, "Av": 5,
                    "Elul": 6, "Tishrei": 7, "Cheshvan": 8, "Kislev": 9
                ]

                let month = monthMap[monthStr] ?? 1

                return HebrewDate(
                    gregorianDate: gregorianDate,
                    hebrewDateString: response.hebrew,
                    hebrewYear: year,
                    hebrewMonth: month,
                    hebrewDay: day
                )
            }
        } catch {
            logger.error("Failed to fetch Hebrew date: \(error)")
        }

        return nil
    }

    private func fetchTorahPortion(for date: Date) async -> TorahPortion? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateString = formatter.string(from: date)

        let urlString = "\(baseURL)/events?cfg=json&date=\(dateString)&i=on&sedrot=on"
        guard let url = URL(string: urlString) else {
            logger.error("Invalid Torah portion URL")
            return nil
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoder = JSONDecoder()

            if let response = try? decoder.decode(HebcalResponse.self, from: data) {
                // Find the parsha event
                if let parshEvent = response.events.first(where: { ($0.category ?? "").lowercased().contains("parsha") }) {
                    let title = parshEvent.title
                    let hebrewTitle = parshEvent.hebrew ?? title
                    let id = title.lowercased().replacingOccurrences(of: " ", with: "-")
                    let description = Self.parashaDescriptions[title]

                    return TorahPortion(
                        id: id,
                        name: title,
                        hebrewName: hebrewTitle,
                        date: date,
                        aliyot: [],
                        description: description
                    )
                }
            }
        } catch {
            logger.error("Failed to fetch Torah portion: \(error)")
        }

        return nil
    }

    private func cacheKey(for date: Date, prefix: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return "\(prefix)_\(formatter.string(from: date))"
    }
}

// MARK: - Cache Wrapper

private class CachedHebrewData {
    let hebrewDate: HebrewDate?
    let torahPortion: TorahPortion?

    init(hebrewDate: HebrewDate? = nil, torahPortion: TorahPortion? = nil) {
        self.hebrewDate = hebrewDate
        self.torahPortion = torahPortion
    }
}
