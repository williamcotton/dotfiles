import Cocoa
import WebKit

class ViewController: NSViewController {
    @IBOutlet weak var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Read input text from standard input
        let inputText = String(data: FileHandle.standardInput.availableData, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        
        // Create HTML content for popup window
        let html = """
        <html>
            <body>
                <div style="width: 200px; height: 200px; background-color: white; border: 1px solid black; padding: 10px;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Input Text:</div>
                    <div style="font-size: 14px; white-space: pre-wrap;">\(inputText)</div>
                    <button onclick="window.close();" style="margin-top: 10px;">Close</button>
                </div>
            </body>
        </html>
        """
        
        // Load HTML content into web view
        webView.loadHTMLString(html, baseURL: nil)
    }
    
    override func viewWillDisappear() {
        super.viewWillDisappear()
        
        // Write output text to standard output when window is closed
        let outputText = String(data: FileHandle.standardInput.availableData, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        FileHandle.standardOutput.write(outputText.data(using: .utf8)!)
    }
}

let viewController = ViewController()
let window = NSWindow(contentViewController: viewController)
window.setContentSize(NSSize(width: 200, height: 200))
window.makeKeyAndOrderFront(nil)
NSApp.activate(ignoringOtherApps: true)
NSApp.run()