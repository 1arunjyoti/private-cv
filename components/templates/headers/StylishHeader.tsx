import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Svg,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "@react-pdf/renderer";
import type { HeaderProps } from "@/lib/template-factory";
import { ProfileImage } from "@/components/templates/core/primitives/ProfileImage";

export const StylishHeader: React.FC<HeaderProps> = ({
  basics,
  settings,
  fonts,
  getColor,
}) => {
  const themeColor = getColor("decorations", "#2563eb");

  const styles = StyleSheet.create({
    headerContainer: {
      position: "relative",
      height: 100, // Reduced height for the header area
      marginBottom: 8, // Reduced bottom margin
      width: "100%",
    },
    background: {
      position: "absolute",
      top: -40, // Larger negative to reach page edge
      left: -40, // Larger negative to reach page edge
      right: -40,
      width: "130%",
      height: 180,
    },
    content: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      paddingTop: 0, // No padding at top
      paddingLeft: 0, // Aligned with content
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    textContent: {
      flex: 1,
    },
    imageWrapper: {
      marginLeft: 12,
    },
    name: {
      fontSize: 32,
      fontFamily: fonts.bold,
      fontWeight: "bold",
      color: themeColor,
      lineHeight: 1.2,
      marginBottom: 0,
    },
    title: {
      fontSize: 14,
      fontFamily: fonts.base,
      color: "#333333", // Dark grey for title
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 4,
    },
    contactItem: {
      fontSize: 9,
      fontFamily: fonts.base,
      color: "#555555",
      flexDirection: "row",
      alignItems: "center",
    },
  });

  // The wave path logic matches the provided design - a smooth curve at the top
  // Name is LARGE and Blue
  // Title is below name, smaller
  // Contact info is typically below.

  return (
    <View style={styles.headerContainer}>
      <Svg viewBox="0 0 600 140" style={styles.background}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E0F2FE" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path
          d="M0,0 L600,0 L600,100 Q450,140 300,80 T0,100 Z"
          fill="url(#grad)"
        />
        <Path
          d="M0,0 L600,0 L600,80 Q450,120 300,60 T0,80 Z"
          fill={themeColor}
          fillOpacity="0.05"
        />
      </Svg>

      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.name}>{basics.name}</Text>
          <Text style={styles.title}>{basics.label}</Text>

          <View style={styles.contactRow}>
            {basics.phone && (
              <Text style={styles.contactItem}>{basics.phone}</Text>
            )}
            {basics.email && (
              <>
                <Text style={styles.contactItem}>|</Text>
                <Text style={styles.contactItem}>{basics.email}</Text>
              </>
            )}
            {basics.url && (
              <>
                <Text style={styles.contactItem}>|</Text>
                <Text style={styles.contactItem}>
                  {basics.url.replace(/^https?:\/\//, "")}
                </Text>
              </>
            )}
            {basics.location?.city && (
              <>
                <Text style={styles.contactItem}>|</Text>
                <Text style={styles.contactItem}>{basics.location.city}</Text>
              </>
            )}
            {basics.profiles?.map((profile) => (
              <React.Fragment key={profile.network}>
                <Text style={styles.contactItem}>|</Text>
                <Text style={styles.contactItem}>
                  {profile.network}: {profile.username}
                </Text>
              </React.Fragment>
            ))}
          </View>
        </View>
        {basics.image && (
          <View style={styles.imageWrapper}>
            <ProfileImage
              src={basics.image}
              size="M"
              shape="circle"
              border
              borderColor={themeColor}
              borderWidth={2}
            />
          </View>
        )}
      </View>
    </View>
  );
};
