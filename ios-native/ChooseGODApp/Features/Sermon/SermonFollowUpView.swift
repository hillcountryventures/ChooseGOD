import SwiftUI

// MARK: - View Model

@MainActor
final class SermonFollowUpViewModel: ObservableObject {
    @Published var passageReference = ""
    @Published var generatedPlan: SermonDevotionalPlan?
    @Published var isGenerating = false
    @Published var selectedDay: SermonDevotionalDay?
    
    func generatePlan(userId: String) {
        guard !passageReference.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isGenerating = true
        
        // Simulate brief generation delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            guard let self else { return }
            self.generatedPlan = SermonDevotionalGenerator.generate(
                passageReference: self.passageReference.trimmingCharacters(in: .whitespaces),
                createdBy: userId
            )
            self.isGenerating = false
        }
    }
    
    func reset() {
        passageReference = ""
        generatedPlan = nil
        selectedDay = nil
    }
}

// MARK: - View

struct SermonFollowUpView: View {
    @StateObject private var viewModel = SermonFollowUpViewModel()
    let userId: String
    
    var body: some View {
        NavigationStack {
            Group {
                if let plan = viewModel.generatedPlan {
                    planView(plan)
                } else {
                    inputView
                }
            }
            .navigationTitle("Sermon Follow-Up")
        }
    }
    
    // MARK: - Input
    
    private var inputView: some View {
        VStack(spacing: 24) {
            Spacer()
            
            Image(systemName: "text.book.closed.fill")
                .font(Theme.Typography.iconHuge)
                .foregroundStyle(.indigo)
            
            Text("Create a 5-Day Devotional")
                .font(Theme.Typography.title2)
            
            Text("Enter Sunday's sermon passage and we'll generate a week-long devotional plan for your congregation.")
                .font(Theme.Typography.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            VStack(spacing: 12) {
                TextField("Passage reference (e.g. Romans 8:28-39)", text: $viewModel.passageReference)
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal)
                
                Button {
                    viewModel.generatePlan(userId: userId)
                } label: {
                    HStack {
                        if viewModel.isGenerating {
                            ProgressView()
                                .tint(.white)
                        }
                        Text(viewModel.isGenerating ? "Generating…" : "Generate Devotional Plan")
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(viewModel.passageReference.trimmingCharacters(in: .whitespaces).isEmpty || viewModel.isGenerating)
                .padding(.horizontal)
            }
            
            Spacer()
            Spacer()
        }
    }
    
    // MARK: - Plan View
    
    private func planView(_ plan: SermonDevotionalPlan) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                VStack(spacing: 8) {
                    Text(plan.title)
                        .font(Theme.Typography.title3)
                    Text(plan.passageReference)
                        .font(Theme.Typography.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.top)
                
                // Day Cards
                ForEach(plan.days) { day in
                    NavigationLink {
                        DayDetailView(day: day)
                    } label: {
                        dayCard(day)
                    }
                    .buttonStyle(.plain)
                }
                
                // Actions
                HStack(spacing: 12) {
                    Button(role: .destructive) {
                        viewModel.reset()
                    } label: {
                        Label("Start Over", systemImage: "arrow.counterclockwise")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    
                    ShareLink(
                        item: formatPlanForSharing(plan),
                        subject: Text(plan.title)
                    ) {
                        Label("Share Plan", systemImage: "square.and.arrow.up")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding(.top, Theme.Spacing.sm)
            }
            .padding()
        }
    }
    
    private func dayCard(_ day: SermonDevotionalDay) -> some View {
        HStack(spacing: 16) {
            let dayType = SermonDayType(rawValue: day.dayNumber) ?? .fullPassage
            
            Image(systemName: dayType.icon)
                .font(Theme.Typography.title2)
                .foregroundStyle(.white)
                .frame(width: 48, height: 48)
                .background(colorForDay(day.dayNumber))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Day \(day.dayNumber)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(.secondary)
                Text(day.title)
                    .font(Theme.Typography.headline)
                Text(day.subtitle)
                    .font(Theme.Typography.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            Image(systemName: "chevron.right")
                .foregroundStyle(.tertiary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    private func colorForDay(_ day: Int) -> Color {
        switch day {
        case 1: return .blue
        case 2: return .purple
        case 3: return .orange
        case 4: return .green
        case 5: return .indigo
        default: return .gray
        }
    }
    
    private func formatPlanForSharing(_ plan: SermonDevotionalPlan) -> String {
        var text = "\(plan.title)\n\n"
        for day in plan.days {
            text += "📅 Day \(day.dayNumber): \(day.title)\n\(day.content)\n\n"
        }
        return text
    }
}

// MARK: - Day Detail View

struct DayDetailView: View {
    let day: SermonDevotionalDay
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("Day \(day.dayNumber)")
                        .font(Theme.Typography.subheadline)
                        .foregroundStyle(.secondary)
                    Text(day.title)
                        .font(Theme.Typography.title2)
                    Text(day.subtitle)
                        .font(Theme.Typography.subheadline)
                        .foregroundStyle(.secondary)
                }
                
                Divider()
                
                // Passage
                if let ref = day.passageReference {
                    Label(ref, systemImage: "book.fill")
                        .font(Theme.Typography.headline)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.blue.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                
                // Content
                Text(day.content)
                    .font(Theme.Typography.body)
                    .lineSpacing(4)
                
                // Cross References
                if let refs = day.crossReferences, !refs.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Cross-References")
                            .font(Theme.Typography.headline)
                        ForEach(refs, id: \.self) { ref in
                            Label(ref, systemImage: "link")
                                .font(Theme.Typography.subheadline)
                        }
                    }
                    .padding()
                    .background(.purple.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                
                // Questions
                if let questions = day.questions, !questions.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Reflection Questions")
                            .font(Theme.Typography.headline)
                        ForEach(Array(questions.enumerated()), id: \.offset) { index, question in
                            HStack(alignment: .top, spacing: 8) {
                                Text("\(index + 1).")
                                    .font(Theme.Typography.subheadlineSemibold)
                                    .foregroundStyle(.orange)
                                Text(question)
                                    .font(Theme.Typography.subheadline)
                            }
                        }
                    }
                    .padding()
                    .background(.orange.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                
                // Prayer
                if let prayer = day.prayerPrompt {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Prayer")
                            .font(Theme.Typography.headline)
                        Text(prayer)
                            .font(Theme.Typography.subheadline)
                            .italic()
                    }
                    .padding()
                    .background(.green.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                
                // Memory Verse
                if let verse = day.memoryVerse {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Memory Verse")
                            .font(Theme.Typography.headline)
                        Text(verse)
                            .font(Theme.Typography.subheadline)
                            .italic()
                    }
                    .padding()
                    .background(.indigo.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    SermonFollowUpView(userId: "preview-user")
}
