import Foundation
import Supabase

/// Global convenience accessor for Supabase client
/// Provides backward compatibility for code expecting `supabase` instance
var supabase: SupabaseClient {
    guard let client = SupabaseManager.shared.client else {
        fatalError("Supabase client not initialized. Call SupabaseManager.shared.initialize() first.")
    }
    return client
}