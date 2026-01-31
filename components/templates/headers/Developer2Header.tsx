import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { HeaderProps } from "@/lib/template-factory";
export const Developer2Header: React.FC<HeaderProps> = ({
  basics,
  fonts,
  headerTextColor,
}) => {
  const styles = StyleSheet.create({
    container: {
      height: "100%",
      width: "100%",
      position: "relative",
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
      marginLeft: -300,
      marginTop: -35,
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
      {/* <View style={styles.borderBox} /> */}
      <View style={styles.nameWrapper}>
        <Text style={styles.name}>{basics.name}</Text>
      </View>
    </View>
  );
};
