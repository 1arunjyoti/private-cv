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
import type { Resume } from "@/db";
import { ProfileImage } from "@/components/templates/core/primitives/ProfileImage";
import {
  ContactInfo,
  ContactItem,
} from "@/components/templates/core/primitives/ContactInfo";

// Helper to convert basics to contact items
function basicsToContactItems(
  basics: Resume["basics"],
  showFullUrl: boolean = false,
): ContactItem[] {
  const items: ContactItem[] = [];

  if (basics.email) {
    items.push({
      type: "email",
      value: basics.email,
      url: `mailto:${basics.email}`,
    });
  }
  if (basics.phone) {
    items.push({
      type: "phone",
      value: basics.phone,
      url: `tel:${basics.phone}`,
    });
  }
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.country]
      .filter(Boolean)
      .join(", ");
    items.push({ type: "location", value: loc });
  }
  if (basics.url) {
    items.push({
      type: "url",
      value: showFullUrl
        ? basics.url
        : basics.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      url: basics.url,
    });
  }

  basics.profiles?.forEach((profile) => {
    if (profile.url) {
      items.push({
        type: "profile",
        value: profile.username || profile.network || profile.url,
        url: profile.url,
        label: showFullUrl
          ? `${profile.network}: ${profile.url}`
          : profile.username
            ? `${profile.network}: ${profile.username}`
            : profile.network,
      });
    }
  });

  return items;
}

export const StylishHeader: React.FC<HeaderProps> = ({
  basics,
  settings,
  fonts,
  getColor,
  fontSize,
  headerTextColor,
}) => {
  const themeColor = getColor("decorations", "#2563eb");
  const nameColor = getColor("name", themeColor);
  const titleColor = getColor("title", "#333333");

  const styles = StyleSheet.create({
    headerContainer: {
      position: "relative",
      height: 100, // Reduced height for the header area
      marginBottom: settings.headerBottomMargin || 8,
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
      alignItems:
        settings.headerPosition === "top"
          ? "center"
          : settings.headerPosition === "right"
            ? "flex-end"
            : "flex-start",
      textAlign:
        settings.headerPosition === "top"
          ? "center"
          : settings.headerPosition === "right"
            ? "right"
            : "left",
    },
    imageWrapper: {
      marginLeft:
        settings.profilePhotoPosition === "right" ||
        !settings.profilePhotoPosition
          ? 12
          : 0,
      marginRight: settings.profilePhotoPosition === "left" ? 12 : 0,
    },
    name: {
      fontSize: settings.nameFontSize || 32,
      fontFamily:
        settings.nameFont === "creative"
          ? "Helvetica"
          : settings.nameBold
            ? settings.nameItalic
              ? fonts.boldItalic
              : fonts.bold
            : settings.nameItalic
              ? fonts.italic
              : fonts.base,
      fontWeight: settings.nameBold ? "bold" : "normal",
      fontStyle: settings.nameItalic ? "italic" : "normal",
      color: nameColor,
      lineHeight: settings.nameLineHeight || 1.2,
      marginBottom: 0,
      textTransform: "uppercase",
      letterSpacing:
        ((settings as unknown as Record<string, unknown>)
          .nameLetterSpacing as number) || 0,
    },
    title: {
      fontSize: settings.titleFontSize || 14,
      fontFamily: settings.titleBold
        ? fonts.bold
        : settings.titleItalic
          ? fonts.italic
          : fonts.base,
      fontWeight: settings.titleBold ? "bold" : "normal",
      fontStyle: settings.titleItalic ? "italic" : "normal",
      color: titleColor,
      marginBottom: 8,
      lineHeight: settings.titleLineHeight || 1.2,
    },
  });

  // Photo settings
  const showPhoto = !!basics.image;
  const photoPosition = settings.profilePhotoPosition || "right";
  const photoSize = settings.profilePhotoSize || 80;
  const photoShape = settings.profilePhotoShape || "circle";

  const imageView = showPhoto && (
    <View style={styles.imageWrapper}>
      <ProfileImage
        src={basics.image}
        customSize={photoSize}
        shape={photoShape}
        border={settings.profilePhotoBorder ?? false}
        borderColor={themeColor}
        borderWidth={2}
      />
    </View>
  );

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
        {photoPosition === "left" && imageView}
        <View style={styles.textContent}>
          <Text style={styles.name}>{basics.name}</Text>
          <Text style={styles.title}>{basics.label}</Text>

          <ContactInfo
            items={basicsToContactItems(basics, settings.linkShowFullUrl)}
            style={
              settings.personalDetailsArrangement === 2
                ? "stacked"
                : settings.personalDetailsContactStyle || "bar"
            }
            align={
              settings.headerPosition === "top"
                ? "center"
                : settings.headerPosition === "right"
                  ? "right"
                  : "left"
            }
            fontSize={settings.contactFontSize || fontSize}
            fonts={fonts}
            getColor={getColor}
            bold={settings.contactBold}
            italic={settings.contactItalic}
            separator={settings.contactSeparator}
            linkUnderline={
              ((settings as unknown as Record<string, unknown>)
                .contactLinkUnderline as boolean) ?? true
            }
            lineHeight={
              settings.contactLineHeight || settings.lineHeight || 1.2
            }
            separatorGap={settings.contactSeparatorGap}
            color={headerTextColor}
          />
        </View>
        {(photoPosition === "right" || !photoPosition) && imageView}
      </View>
    </View>
  );
};
