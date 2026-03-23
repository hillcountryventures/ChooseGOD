import SwiftUI
import PhotosUI

struct JournalComposeView: View {
    @Bindable var viewModel: JournalViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.Colors.background.ignoresSafeArea()

                VStack {
                    HStack {
                        Text("New Entry")
                            .font(.title2)
                            .bold()
                        Spacer()
                        Button("Done") { dismiss() }
                    }
                    .padding()

                    Text("Journal entry composition view")
                        .foregroundStyle(Theme.Colors.secondaryText)
                        .padding()

                    Spacer()
                }
            }
        }
    }
}

#Preview {
    JournalComposeView(viewModel: JournalViewModel())
}
