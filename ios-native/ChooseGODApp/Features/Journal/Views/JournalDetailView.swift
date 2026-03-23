import SwiftUI

struct JournalDetailView: View {
    let moment: SpiritualMoment
    
    var body: some View {
        VStack {
            Text("Journal Entry")
                .font(.title)
        }
    }
}

#Preview {
    JournalDetailView(moment: SpiritualMoment(
        id: "1",
        userId: "1",
        momentType: .journal,
        content: "Test entry",
        linkedVerses: [],
        themes: [],
        createdAt: Date()
    ))
}
