import ExpoModulesCore
import Foundation
import Network

private final class WebSocketDelegateProxy: NSObject, URLSessionWebSocketDelegate, URLSessionTaskDelegate {
  var onOpen: ((String?) -> Void)?
  var onClose: ((URLSessionWebSocketTask.CloseCode, Data?) -> Void)?
  var onCompleteWithError: ((Error?) -> Void)?
  var onChallenge: ((URLAuthenticationChallenge, @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) -> Void)?

  func urlSession(
    _ session: URLSession,
    webSocketTask: URLSessionWebSocketTask,
    didOpenWithProtocol protocol: String?
  ) {
    onOpen?(`protocol`)
  }

  func urlSession(
    _ session: URLSession,
    webSocketTask: URLSessionWebSocketTask,
    didCloseWith closeCode: URLSessionWebSocketTask.CloseCode,
    reason: Data?
  ) {
    onClose?(closeCode, reason)
  }

  func urlSession(
    _ session: URLSession,
    task: URLSessionTask,
    didCompleteWithError error: Error?
  ) {
    onCompleteWithError?(error)
  }

  func urlSession(
    _ session: URLSession,
    didReceive challenge: URLAuthenticationChallenge,
    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
  ) {
    if let onChallenge {
      onChallenge(challenge, completionHandler)
    } else {
      completionHandler(.performDefaultHandling, nil)
    }
  }
}

public class SamsungRemoteNativeModule: Module {
  private let delegateProxy = WebSocketDelegateProxy()
  private var session: URLSession?
  private var webSocketTask: URLSessionWebSocketTask?
  private var allowedHost: String = ""
  private var isManuallyClosed: Bool = false
  private let lock = NSLock()

  public func definition() -> ModuleDefinition {
    Name("SamsungRemoteNative")

    Events("onOpen", "onMessage", "onError", "onClose")

    OnCreate {
      self.delegateProxy.onOpen = { [weak self] proto in
        self?.sendEvent("onOpen", ["protocol": proto ?? ""])
        self?.listenForMessages()
      }

      self.delegateProxy.onClose = { [weak self] closeCode, reason in
        let reasonText = reason.flatMap { String(data: $0, encoding: .utf8) } ?? ""
        self?.sendEvent("onClose", ["code": closeCode.rawValue, "reason": reasonText])
      }

      self.delegateProxy.onCompleteWithError = { [weak self] error in
        guard let self = self else { return }
        if let error = error, !self.isManuallyClosed {
          self.sendEvent("onError", ["message": error.localizedDescription])
          self.sendEvent("onClose", ["code": 1006, "reason": error.localizedDescription])
        }
      }

      self.delegateProxy.onChallenge = { [weak self] challenge, completionHandler in
        guard let self = self else {
          completionHandler(.performDefaultHandling, nil)
          return
        }
        if challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
           let serverTrust = challenge.protectionSpace.serverTrust {
          let host = challenge.protectionSpace.host
          if !self.allowedHost.isEmpty && (host == self.allowedHost || host.contains(self.allowedHost)) {
            completionHandler(.useCredential, URLCredential(trust: serverTrust))
            return
          }
        }
        completionHandler(.performDefaultHandling, nil)
      }
    }

    Function("connect") { (urlString: String, host: String) in
      self.lock.lock()
      defer { self.lock.unlock() }

      self.disconnectInternal(code: 1000, reason: "Reconnecting")
      self.isManuallyClosed = false
      self.allowedHost = host

      guard let url = URL(string: urlString) else {
        self.sendEvent("onError", ["message": "Invalid WebSocket URL: \(urlString)"])
        return
      }

      let config = URLSessionConfiguration.default
      config.timeoutIntervalForRequest = 10
      config.timeoutIntervalForResource = 3600
      config.waitsForConnectivity = true

      let queue = OperationQueue()
      queue.maxConcurrentOperationCount = 1
      queue.qualityOfService = .userInitiated

      let newSession = URLSession(configuration: config, delegate: self.delegateProxy, delegateQueue: queue)
      self.session = newSession

      var request = URLRequest(url: url)
      request.timeoutInterval = 10

      let task = newSession.webSocketTask(with: request)
      self.webSocketTask = task
      task.resume()
    }

    Function("send") { (message: String) in
      self.lock.lock()
      guard let task = self.webSocketTask else {
        self.lock.unlock()
        self.sendEvent("onError", ["message": "Socket not connected"])
        return
      }
      self.lock.unlock()

      let msg = URLSessionWebSocketTask.Message.string(message)
      task.send(msg) { [weak self] error in
        if let error = error {
          self?.sendEvent("onError", ["message": "Send failed: \(error.localizedDescription)"])
        }
      }
    }

    Function("disconnect") { (code: Int, reason: String?) in
      self.lock.lock()
      self.isManuallyClosed = true
      self.disconnectInternal(code: code, reason: reason ?? "Client disconnect")
      self.lock.unlock()
    }

    Function("isConnected") { () -> Bool in
      self.lock.lock()
      defer { self.lock.unlock() }
      return self.webSocketTask?.state == .running
    }

    AsyncFunction("sendWakeOnLan") { (macAddress: String, broadcastIp: String?) -> Bool in
      return self.sendMagicPacket(mac: macAddress, broadcastIp: broadcastIp ?? "255.255.255.255")
    }

    AsyncFunction("discoverSamsungTvs") { (timeoutSeconds: Double, promise: Promise) in
      DispatchQueue.global(qos: .userInitiated).async {
        let results = self.performSsdpDiscovery(timeout: timeoutSeconds)
        promise.resolve(results)
      }
    }
  }

  // MARK: - Internal Teardown
  private func disconnectInternal(code: Int, reason: String) {
    if let task = self.webSocketTask {
      let closeCode = URLSessionWebSocketTask.CloseCode(rawValue: code) ?? .normalClosure
      task.cancel(with: closeCode, reason: reason.data(using: .utf8))
      self.webSocketTask = nil
    }
    self.session?.invalidateAndCancel()
    self.session = nil
  }

  // MARK: - Message Loop
  private func listenForMessages() {
    self.webSocketTask?.receive { [weak self] result in
      guard let self = self else { return }

      switch result {
      case .success(let message):
        switch message {
        case .string(let text):
          self.sendEvent("onMessage", ["data": text])
        case .data(let data):
          if let text = String(data: data, encoding: .utf8) {
            self.sendEvent("onMessage", ["data": text])
          }
        @unknown default:
          break
        }
        self.listenForMessages()

      case .failure(let error):
        if !self.isManuallyClosed {
          self.sendEvent("onError", ["message": error.localizedDescription])
          self.sendEvent("onClose", ["code": 1006, "reason": error.localizedDescription])
        }
      }
    }
  }

  // MARK: - Wake-on-LAN Magic Packet
  private func sendMagicPacket(mac: String, broadcastIp: String) -> Bool {
    let cleanMac = mac.uppercased()
      .replacingOccurrences(of: ":", with: "")
      .replacingOccurrences(of: "-", with: "")
      .trimmingCharacters(in: .whitespacesAndNewlines)

    guard cleanMac.count == 12 else { return false }

    var macBytes = [UInt8]()
    var idx = cleanMac.startIndex
    for _ in 0..<6 {
      let nextIdx = cleanMac.index(idx, offsetBy: 2)
      let byteStr = String(cleanMac[idx..<nextIdx])
      guard let byte = UInt8(byteStr, radix: 16) else { return false }
      macBytes.append(byte)
      idx = nextIdx
    }

    var packet = [UInt8](repeating: 0xFF, count: 6)
    for _ in 0..<16 {
      packet.append(contentsOf: macBytes)
    }

    let sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)
    guard sock >= 0 else { return false }
    defer { close(sock) }

    var broadcastOpt: Int32 = 1
    setsockopt(sock, SOL_SOCKET, SO_BROADCAST, &broadcastOpt, socklen_t(MemoryLayout<Int32>.size))

    var success = false
    for port: UInt16 in [9, 7] {
      var addr = sockaddr_in()
      addr.sin_family = sa_family_t(AF_INET)
      addr.sin_port = port.bigEndian
      inet_pton(AF_INET, broadcastIp, &addr.sin_addr)

      let bytesSent = withUnsafePointer(to: &addr) {
        $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
          sendto(sock, packet, packet.count, 0, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
        }
      }
      if bytesSent == packet.count {
        success = true
      }
    }
    return success
  }

  // MARK: - SSDP Discovery
  private func performSsdpDiscovery(timeout: Double) -> [[String: Any]] {
    let sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)
    guard sock >= 0 else { return [] }
    defer { close(sock) }

    var broadcastOpt: Int32 = 1
    setsockopt(sock, SOL_SOCKET, SO_BROADCAST, &broadcastOpt, socklen_t(MemoryLayout<Int32>.size))

    var tv = timeval()
    tv.tv_sec = __darwin_time_t(floor(timeout))
    tv.tv_usec = __darwin_suseconds_t((timeout.truncatingRemainder(dividingBy: 1)) * 1_000_000)
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, socklen_t(MemoryLayout<timeval>.size))

    let searchTargets = [
      "urn:samsung.com:device:RemoteControlReceiver:1",
      "ssdp:all"
    ]

    var discoveredMap = [String: [String: Any]]()

    for st in searchTargets {
      let query = "M-SEARCH * HTTP/1.1\r\n" +
        "HOST: 239.255.255.250:1900\r\n" +
        "MAN: \"ssdp:discover\"\r\n" +
        "MX: 2\r\n" +
        "ST: \(st)\r\n\r\n"

      var addr = sockaddr_in()
      addr.sin_family = sa_family_t(AF_INET)
      addr.sin_port = UInt16(1900).bigEndian
      inet_pton(AF_INET, "239.255.255.250", &addr.sin_addr)

      guard let queryData = query.data(using: .utf8) else { continue }
      let queryBytes = [UInt8](queryData)

      withUnsafePointer(to: &addr) {
        $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
          _ = sendto(sock, queryBytes, queryBytes.count, 0, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
        }
      }
    }

    var buffer = [UInt8](repeating: 0, count: 4096)
    let startTime = Date()

    while Date().timeIntervalSince(startTime) < timeout {
      var senderAddr = sockaddr_in()
      var addrLen = socklen_t(MemoryLayout<sockaddr_in>.size)

      let received = withUnsafeMutablePointer(to: &senderAddr) {
        $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
          recvfrom(sock, &buffer, buffer.count, 0, $0, &addrLen)
        }
      }

      if received <= 0 {
        break
      }

      var ipStr = [CChar](repeating: 0, count: Int(INET_ADDRSTRLEN))
      inet_ntop(AF_INET, &senderAddr.sin_addr, &ipStr, socklen_t(INET_ADDRSTRLEN))
      let ip = String(cString: ipStr)

      if let responseText = String(bytes: buffer[0..<received], encoding: .utf8) {
        let isSamsung = responseText.localizedCaseInsensitiveContains("samsung") ||
                        responseText.localizedCaseInsensitiveContains("tizen") ||
                        responseText.localizedCaseInsensitiveContains("RemoteControlReceiver")

        if isSamsung && !ip.isEmpty && discoveredMap[ip] == nil {
          var name = "Samsung Smart TV"
          for line in responseText.components(separatedBy: "\r\n") {
            if line.uppercased().hasPrefix("SERVER:") {
              name = line.replacingOccurrences(of: "SERVER:", with: "").trimmingCharacters(in: .whitespaces)
            }
          }
          discoveredMap[ip] = [
            "ip": ip,
            "name": name,
            "raw": responseText
          ]
        }
      }
    }

    return Array(discoveredMap.values)
  }
}
