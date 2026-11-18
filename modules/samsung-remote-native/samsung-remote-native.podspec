Pod::Spec.new do |s|
  s.name           = 'SamsungRemoteNative'
  s.version        = '1.0.0'
  s.summary        = 'Native WebSocket with self-signed SSL certificate trust and Wake-on-LAN for Samsung Remote'
  s.description    = 'Native WebSocket with self-signed SSL certificate trust and Wake-on-LAN for Samsung Remote'
  s.author         = 'SamsungRemote'
  s.homepage       = 'https://github.com/example/samsung-remote'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => '' }
  s.source_files   = 'ios/**/*.{h,m,mm,swift}'
  s.dependency 'ExpoModulesCore'
  s.swift_version  = '5.0'
end
