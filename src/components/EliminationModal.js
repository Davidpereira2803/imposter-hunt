import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Button from "./ui/Button";
import Title from "./ui/Title";
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
        <Animated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.modalBackground}
        >
          <Animated.View
            entering={ZoomIn.duration(400).delay(100).springify()}
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
        </Animated.View>
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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: space.lg,
  },
  modalContent: {
    backgroundColor: '#0d1117',
    borderRadius: radii.xl,
    padding: space.xl,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: palette.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 3,
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
  
  continueButton: {
    width: "100%",
  },
});