import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { HeaderProps } from "@/lib/template-factory";
import { ProfileImage } from "@/components/templates/core/primitives/ProfileImage";

export const Developer2Header: React.FC<HeaderProps> = ({
  basics,
  settings,
  fonts,
  getColor,
  headerTextColor,
}) => {
  const photoSize = settings.profilePhotoSize || 60;
  const photoShape = settings.profilePhotoShape || "circle";

  const styles = StyleSheet.create({
    container: {
      height: "100%",
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    // Profile photo at top
    photoWrapper: {
      marginTop: 20,
      marginBottom: 10,
    },
    // The vertical name container
    nameWrapper: {
      transform: "rotate(-90deg)",
      width: 600,
      height: 70,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      left: "50%",
      top: "50%",
      marginLeft: -350,
      marginTop: basics.image ? 0 : -35,
    },
    name: {
      fontSize: 42,
      fontFamily: fonts.bold,
      fontWeight: "bold",
      color: headerTextColor || "#FFFFFF",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
  });

  return (
    <View style={styles.container}>
      {/* Profile Photo */}
      {basics.image && (
        <View style={styles.photoWrapper}>
          <ProfileImage
            src={basics.image}
            customSize={photoSize}
            shape={photoShape}
            border={settings.profilePhotoBorder ?? false}
            borderColor={getColor("decorations", "#3b82f6")}
            borderWidth={2}
          />
        </View>
      )}
      {/* Vertical Name */}
      <View style={styles.nameWrapper}>
        <Text style={styles.name}>{basics.name}</Text>
      </View>
    </View>
  );
};
