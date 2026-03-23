import SwiftUI

struct JournalListView: View {
    @State private var viewModel = JournalViewModel()
    @State private var showCompose = false
    
    var body: some View {
        ZStack {
            Theme.Colors.background.ignoresSafeArea()
            VStack {
                Text("Journal")
                    .font(.title)
                Text("Your spiritual reflections")
                    .font(.subheadline)
            }
        }
    }
}

#Preview {
    JournalListView()
}
