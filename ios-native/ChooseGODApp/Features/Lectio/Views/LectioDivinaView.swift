import SwiftUI

struct LectioDivinaView: View {
    var body: some View {
        VStack {
            Text("Lectio Divina")
                .font(.title)
                .padding()
            
            Text("Coming Soon")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

#Preview {
    LectioDivinaView()
}