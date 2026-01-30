import Foundation
import Network
import Observation

/// Monitors network connectivity using NWPathMonitor
@Observable
final class NetworkMonitor {
    static let shared = NetworkMonitor()

    /// nil = indeterminate, true = online, false = offline
    var isConnected: Bool?

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "com.choosegod.networkmonitor")

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
            }
        }
        monitor.start(queue: queue)
    }

    deinit {
        monitor.cancel()
    }
}
