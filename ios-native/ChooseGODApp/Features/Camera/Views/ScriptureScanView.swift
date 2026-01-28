import SwiftUI
import AVFoundation

/// Camera view for scanning Bible text using Vision OCR
struct ScriptureScanView: View {
    @StateObject private var scanService = ScriptureScanService()
    @StateObject private var camera = CameraModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ZStack {
            // Camera preview
            CameraPreviewView(session: camera.session)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                header
                
                // Instructions
                instructions
                
                Spacer()
                
                // Controls
                controls
            }
            
            // Processing overlay
            if scanService.isProcessing {
                processingOverlay
            }
        }
        .background(Color.black)
        .onAppear { camera.start() }
        .onDisappear { camera.stop() }
        .fullScreenCover(item: $scanService.lastResult) { result in
            ScanResultView(result: result)
        }
    }
    
    // MARK: - Header
    
    private var header: some View {
        HStack {
            Button { dismiss() } label: {
                Image(systemName: "xmark")
                    .font(.title2.weight(.semibold))
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
            }
            
            Spacer()
            
            Text("Scripture Scan")
                .font(.headline)
                .foregroundColor(.white)
            
            Spacer()
            
            Color.clear.frame(width: 44, height: 44)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(.black.opacity(0.5))
    }
    
    // MARK: - Instructions
    
    private var instructions: some View {
        VStack(spacing: 6) {
            Image(systemName: "viewfinder")
                .font(.system(size: 28))
                .foregroundColor(.white.opacity(0.9))
            
            Text("Point camera at any text")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.white)
            
            Text("Books, signs, quotes — discover what the Bible says")
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
        }
        .padding()
        .background(.black.opacity(0.5))
    }
    
    // MARK: - Controls
    
    private var controls: some View {
        HStack {
            // Flip camera
            Button { camera.toggleFacing() } label: {
                Image(systemName: "camera.rotate")
                    .font(.system(size: 24))
                    .foregroundColor(.white)
                    .frame(width: 60, height: 60)
            }
            
            Spacer()
            
            // Capture
            Button { captureAndScan() } label: {
                ZStack {
                    Circle()
                        .fill(.white)
                        .frame(width: 76, height: 76)
                    Circle()
                        .fill(Theme.Colors.primary)
                        .frame(width: 64, height: 64)
                }
            }
            .disabled(scanService.isProcessing)
            
            Spacer()
            
            Color.clear.frame(width: 60, height: 60)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
        .background(.black.opacity(0.5))
    }
    
    // MARK: - Processing overlay
    
    private var processingOverlay: some View {
        ZStack {
            Color.black.opacity(0.85).ignoresSafeArea()
            VStack(spacing: 16) {
                ProgressView()
                    .tint(.white)
                    .scaleEffect(1.5)
                Text("Reading text...")
                    .font(.headline)
                    .foregroundColor(.white)
                Text("Finding biblical insights")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
        }
    }
    
    private func captureAndScan() {
        Task {
            guard let image = await camera.capturePhoto() else { return }
            _ = await scanService.recognizeText(from: image)
        }
    }
}

// MARK: - Camera Model

@MainActor
final class CameraModel: ObservableObject {
    let session = AVCaptureSession()
    private var photoOutput = AVCapturePhotoOutput()
    private var currentDevice: AVCaptureDevice?
    private var position: AVCaptureDevice.Position = .back
    private var photoContinuation: CheckedContinuation<UIImage?, Never>?
    private let delegate = PhotoDelegate()
    
    func start() {
        guard AVCaptureDevice.authorizationStatus(for: .video) == .authorized ||
              AVCaptureDevice.authorizationStatus(for: .video) == .notDetermined else { return }
        
        Task {
            if AVCaptureDevice.authorizationStatus(for: .video) == .notDetermined {
                _ = await AVCaptureDevice.requestAccess(for: .video)
            }
            configureSession()
        }
    }
    
    func stop() {
        if session.isRunning {
            session.stopRunning()
        }
    }
    
    func toggleFacing() {
        position = position == .back ? .front : .back
        configureSession()
    }
    
    func capturePhoto() async -> UIImage? {
        await withCheckedContinuation { cont in
            delegate.continuation = cont
            let settings = AVCapturePhotoSettings()
            photoOutput.capturePhoto(with: settings, delegate: delegate)
        }
    }
    
    private func configureSession() {
        session.beginConfiguration()
        session.inputs.forEach { session.removeInput($0) }
        session.outputs.forEach { session.removeOutput($0) }
        
        session.sessionPreset = .photo
        
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position),
              let input = try? AVCaptureDeviceInput(device: device) else {
            session.commitConfiguration()
            return
        }
        
        if session.canAddInput(input) { session.addInput(input) }
        if session.canAddOutput(photoOutput) { session.addOutput(photoOutput) }
        
        session.commitConfiguration()
        
        if !session.isRunning {
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.session.startRunning()
            }
        }
    }
}

// MARK: - Photo Delegate

private class PhotoDelegate: NSObject, AVCapturePhotoCaptureDelegate {
    var continuation: CheckedContinuation<UIImage?, Never>?
    
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        let image: UIImage?
        if let data = photo.fileDataRepresentation() {
            image = UIImage(data: data)
        } else {
            image = nil
        }
        continuation?.resume(returning: image)
        continuation = nil
    }
}

// MARK: - Camera Preview (UIViewRepresentable)

struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession
    
    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        let layer = AVCaptureVideoPreviewLayer(session: session)
        layer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(layer)
        return view
    }
    
    func updateUIView(_ uiView: UIView, context: Context) {
        if let layer = uiView.layer.sublayers?.first as? AVCaptureVideoPreviewLayer {
            layer.frame = uiView.bounds
        }
    }
}

// Make ScanResult work with fullScreenCover
extension ScanResult: @retroactive Equatable {
    static func == (lhs: ScanResult, rhs: ScanResult) -> Bool { lhs.id == rhs.id }
}

#Preview {
    ScriptureScanView()
}
