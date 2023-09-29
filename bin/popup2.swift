import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Hello, world!")
        Button("Done") { exit(0) }
    }
}

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .frame(minWidth: 200, maxWidth: 200, minHeight: 200, maxHeight: 200)
                .onAppear {
                    print("appeared")
                    if let window = NSApplication.shared.windows.first {
                        window.makeKey()
                    }
                }
        }
        .windowStyle(HiddenTitleBarWindowStyle())
    }
}