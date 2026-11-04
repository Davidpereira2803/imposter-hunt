import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import Animated, { ZoomIn, ReduceMotion } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import ModalFrame from "./ui/ModalFrame";
import Button from "./ui/Button";
import { Icon } from "../constants/icons";
import { space, palette, type, radii } from "../constants/theme";
import { useTranslation } from "../lib/useTranslation";

export default function EliminationModal({ 
  visible, 
  playerName, 
  remainingCount, 
  nextRound,
  onContinue 
}) {
  const { t } = useTranslation();

  const handleContinue = async () => {
    try { 
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
    } catch {}
    onContinue?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleContinue}
    >
      <BlurView intensity={90} style={styles.modalOverlay}>
        <ModalFrame>
          <Animated.View
            entering={ZoomIn.duration(400).delay(100).springify().reduceMotion(ReduceMotion.System)}
            style={styles.modalContent}
          >
            {/* Icon Header with Background */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackdrop} />
              <Icon name="close-circle" size={72} color={palette.danger} />
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.modalTitle}>
                {t("vote.playerEliminated", "Player Eliminated")}
              </Text>
              <View style={styles.titleDivider} />
            </View>

            {/* Eliminated Player Name */}
            <View style={styles.playerSection}>
              <Text style={styles.eliminatedPlayerName}>
                {playerName}
              </Text>
            </View>

            {/* Info Cards */}
            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <View style={styles.infoIconWrapper}>
                  <Icon name="alert" size={24} color={palette.danger} />
                </View>
                <Text style={styles.infoCardText}>
                  {t("vote.notTheImposter", "Not the imposter!")}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconWrapper}>
                  <Icon name="account-group" size={24} color={palette.danger} />
                </View>
                <Text style={styles.infoCardText}>
                  {t("vote.playersRemain", "{{count}} players remain", {
                    count: remainingCount
                  })}
                </Text>
              </View>
            </View>

            <Text style={styles.continueHint}>
              {t("vote.nextRoundHint", "Same match and secret word. Keep discussing.")}
            </Text>

            {/* Continue Button */}
            <Button
              title={t("vote.continueToRound", "Continue to Round {{round}}", {
                round: nextRound
              })}
              onPress={handleContinue}
              variant="danger"
              size="lg"
              style={styles.continueButton}
            />
          </Animated.View>
        </ModalFrame>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: palette.panel,
    borderRadius: radii.xl,
    padding: space.xl,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: palette.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  
  iconContainer: {
    position: "relative",
    marginBottom: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackdrop: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palette.danger,
    opacity: 0.1,
  },
  
  titleSection: {
    alignItems: "center",
    marginBottom: space.lg,
  },
  modalTitle: {
    fontSize: type.h3,
    fontWeight: "800",
    color: palette.text,
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  titleDivider: {
    width: 60,
    height: 3,
    backgroundColor: palette.danger,
    marginTop: space.sm,
    borderRadius: radii.sm,
  },
  
  playerSection: {
    backgroundColor: palette.backgroundDim,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
    marginBottom: space.xl,
    width: "100%",
    borderWidth: 4,
    borderColor: palette.danger,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderRadius: radii.lg,
  },
  eliminatedPlayerName: {
    fontSize: type.h2,
    fontWeight: "900",
    color: palette.danger,
    textAlign: "center",
    letterSpacing: 1,
  },
  
  infoContainer: {
    width: "100%",
    gap: space.md,
    marginBottom: space.xl,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.backgroundDim,
    padding: space.lg,
    borderRadius: radii.lg,
    gap: space.md,
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardText: {
    flex: 1,
    fontSize: type.body,
    color: palette.text,
    fontWeight: "700",
  },
  continueHint: {
    width: "100%",
    color: palette.textDim,
    fontSize: type.small,
    textAlign: "center",
    marginBottom: space.md,
  },
  
  continueButton: {
    width: "100%",
  },
});
