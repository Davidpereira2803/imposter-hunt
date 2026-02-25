import { Platform } from "react-native";
import {
  AD_BANNER_UNIT_ID,
  AD_REWARDED_UNIT_ID,
  AD_BANNER_UNIT_ID_IOS,
  AD_REWARDED_UNIT_ID_IOS,
} from "@env";

const ADS_CONFIG = {
  BANNER_UNIT_ID:
    Platform.OS === "ios" ? AD_BANNER_UNIT_ID_IOS : AD_BANNER_UNIT_ID || "",
  REWARDED_UNIT_ID:
    Platform.OS === "ios" ? AD_REWARDED_UNIT_ID_IOS : AD_REWARDED_UNIT_ID || "",
};

export default ADS_CONFIG;