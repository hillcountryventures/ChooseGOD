import SwiftUI

struct AddPrayerView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var content = ""
    
    var body: some View {
        NavigationStack {
            VStack {
                TextEditor(text: $content)
                    .padding()
                
                Button("Save Prayer") {
                    dismiss()
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.blue)
                .foregroundStyle(.white)
                .cornerRadius(8)
                .padding()
            }
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

#Preview {
    AddPrayerView()
}
