import Foundation

extension Date {
    
    // MARK: - Relative Time
    
    /// Returns human-readable relative time ("just now", "5 min ago", "2 days ago")
    var relativeTime: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: self, relativeTo: Date())
    }
    
    /// Verbose relative time ("5 minutes ago", "2 days ago")
    var relativeTimeFull: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter.localizedString(for: self, relativeTo: Date())
    }
    
    // MARK: - Greeting
    
    /// Time-based greeting ("Good morning", "Good afternoon", "Good evening")
    static var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 0..<5: return "Good night"
        case 5..<12: return "Good morning"
        case 12..<17: return "Good afternoon"
        default: return "Good evening"
        }
    }
    
    // MARK: - Formatting Helpers
    
    /// "January 15, 2025"
    var fullDate: String {
        formatted(date: .long, time: .omitted)
    }
    
    /// "Jan 15"
    var shortDate: String {
        formatted(.dateTime.month(.abbreviated).day())
    }
    
    /// "Monday"
    var dayOfWeek: String {
        formatted(.dateTime.weekday(.wide))
    }
    
    /// "Mon"
    var shortDayOfWeek: String {
        formatted(.dateTime.weekday(.abbreviated))
    }
    
    /// "3:30 PM"
    var timeString: String {
        formatted(date: .omitted, time: .shortened)
    }
    
    // MARK: - Calendar Helpers
    
    var isToday: Bool { Calendar.current.isDateInToday(self) }
    var isYesterday: Bool { Calendar.current.isDateInYesterday(self) }
    var isTomorrow: Bool { Calendar.current.isDateInTomorrow(self) }
    
    /// Days between this date and now (positive = future, negative = past)
    var daysFromNow: Int {
        Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: Date()),
                                        to: Calendar.current.startOfDay(for: self)).day ?? 0
    }
}
