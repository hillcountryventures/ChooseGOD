import SwiftUI

struct ScriptureScanView: View {
    var body: some View {
        VStack {
            Text("Scripture Scanner")
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
    ScriptureScanView()
}