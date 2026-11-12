from pathlib import Path
from xml.etree import ElementTree as ET

schemes = Path(__file__).resolve().parents[1] / "ios/microlearn.xcodeproj/xcshareddata/xcschemes"
scheme = ET.parse(schemes / "microlearn.xcscheme")
ET.SubElement(scheme.getroot().find("LaunchAction"), "StoreKitConfigurationFileReference",
              identifier="../../storekit/Learn.storekit")
scheme.write(schemes / "Learn-StoreKit.xcscheme", encoding="utf-8", xml_declaration=True)
