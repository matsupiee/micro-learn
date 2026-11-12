Pod::Spec.new do |s|
  s.name = 'LearnTrial'
  s.version = '1.0.0'
  s.summary = 'Simulator StoreKit trial preview'
  s.description = s.summary
  s.author = 'Micro Learn'
  s.homepage = 'https://github.com/matsupiee/micro-learn'
  s.license = 'MIT'
  s.platform = :ios, '16.4'
  s.source = { :git => 'https://github.com/matsupiee/micro-learn.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'StoreKit'
  s.source_files = '*.swift'
end
