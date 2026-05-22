import SwiftUI

struct ShimmerView: View {
    let height: CGFloat
    @State private var phase = 0.0
    
    var body: some View {
        VStack(spacing: 16) {
            ForEach(0..<5) { _ in
                RoundedRectangle(cornerRadius: 8)
                    .fill(Theme.Colors.secondaryText.opacity(0.25))
                    .frame(height: height)
                    .overlay {
                        GeometryReader { geo in
                            LinearGradient(
                                gradient: Gradient(stops: [
                                    Gradient.Stop(color: .clear, location: 0),
                                    Gradient.Stop(color: Theme.Colors.text.opacity(0.15), location: 0.5),
                                    Gradient.Stop(color: .clear, location: 1)
                                ]),
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            .offset(x: geo.size.width * phase)
                            .mask(
                                RoundedRectangle(cornerRadius: 8)
                            )
                        }
                    }
            }
        }
        .padding(.horizontal, 16)
        .onAppear {
            withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                phase = 1.0
            }
        }
    }
}

// #Preview {
//    ShimmerView(height: 20)
//}
