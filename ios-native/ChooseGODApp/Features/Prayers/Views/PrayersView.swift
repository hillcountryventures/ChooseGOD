import SwiftUI

struct PrayersView: View {
    var body: some View {
        VStack {
            Text("Prayers")
                .font(.title)
            Text("Your prayer requests and answers")
                .font(.subheadline)
        }
    }
}

#Preview {
    PrayersView()
}
