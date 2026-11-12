import ExpoModulesCore
import StoreKit

public final class TrialModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LearnTrial")
    AsyncFunction("purchasePreview") { () async throws -> String in
      #if DEBUG && targetEnvironment(simulator)
      let sku = "learn.local.preview.yearly"
      guard let plan = try await Product.products(for: [sku]).first else { return "unavailable" }
      switch try await plan.purchase() {
      case .success(.verified(let purchase)):
        guard purchase.environment == .xcode, purchase.productID == sku else { return "unavailable" }
        await purchase.finish()
        return "purchased"
      case .userCancelled: return "cancelled"
      case .pending: return "pending"
      default: return "unavailable"
      }
      #else
      return "unavailable"
      #endif
    }
  }
}
