import React from "react";
import { View, Text, Link, Image } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PROFILE_IMAGE_SIZES } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

// Icons (using simple text characters or drawing simple shapes if needed,
// for now utilizing text-based icons or emoji if acceptable, but standard PDF renderers often prefer images or text)
// A common pattern in this project seems to be text or just labels.
// "Andrew Kim" uses icons. For now, I'll use text labels or simple chars to avoid complex SVG handling
// unless I see SVG support in the project. The classic used text labels.
// I'll stick to text labels for simplicity/robustness first, or standard unicode chars.

interface CreativeHeaderProps {
  basics: Resume["basics"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

const ProfileImage = ({
  image,
  settings,
  borderColor,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: string | any;
  settings: LayoutSettings;
  borderColor: string;
}) => {
  if (!image || !settings.showProfileImage) return null;

  const size = PROFILE_IMAGE_SIZES[settings.profileImageSize] || 100;

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      src={image}
      style={{
        width: size,
        height: size,
        borderRadius: settings.profileImageShape === "square" ? 0 : size / 2,
        borderWidth: settings.profileImageBorder ? 1 : 0,
        borderColor: borderColor,
        objectFit: "cover",
        marginBottom: 15,
        alignSelf: "flex-start", // Sidebar alignment
      }}
    />
  );
};

export const CreativeHeader: React.FC<CreativeHeaderProps> = ({
  basics,
  settings,
  getColor,
  baseFont,
  boldFont,
  italicFont,
}) => {
  // Andrew Kim Style:
  // Name: Large, Dark (Theme Color or Dark Text)
  // Title: Italic
  // Contact: Small, Vertical list

  const nameStyle = {
    fontFamily: settings.nameBold ? boldFont : baseFont,
    fontWeight: settings.nameBold ? "bold" : "normal",
    fontSize: settings.nameFontSize,
    color: getColor("name"), // Use theme color for name in this design? andrew kim uses Dark Green.
    marginBottom: 4,
    lineHeight: settings.nameLineHeight,
  } as const;

  const titleStyle = {
    fontFamily: settings.titleBold
      ? boldFont
      : settings.titleItalic
        ? italicFont
        : baseFont,
    fontWeight: settings.titleBold ? "bold" : "normal",
    fontSize: settings.titleFontSize,
    color: getColor("title", "#444"), // Dark Gray/Black
    marginBottom: 16,
    fontStyle: settings.titleItalic ? "italic" : "normal",
    lineHeight: settings.titleLineHeight,
  } as const;

  const contactStyle = {
    fontFamily: settings.contactBold
      ? boldFont
      : settings.contactItalic
        ? italicFont
        : baseFont,
    fontWeight: settings.contactBold ? "bold" : "normal",
    fontStyle: settings.contactItalic ? "italic" : "normal",
    fontSize: settings.contactFontSize,
    color: getColor("text", "#333"), // Dark gray for readability on light bg
    marginBottom: 4,
  } as const;

  // Helper to render contact rows with icons (simulated with text or checks if Image icons are available)
  // For now, simple text lines:
  // [Icon/Label] Value

  const renderContactItem = (value: string, type: string, href?: string) => {
    if (!value) return null;

    // Simple icon mapping (Unicode)
    let icon = "•";
    if (type === "email") icon = "@";
    if (type === "phone") icon = "📞";
    if (type === "location") icon = "📍";
    if (type === "web") icon = "🔗";
    if (type === "linkedin") icon = "in";

    return (
      <View
        style={{ flexDirection: "row", marginBottom: 6, alignItems: "center" }}
      >
        <Text
          style={{
            width: 14,
            fontSize: settings.contactFontSize - 1,
            color: getColor("decorations"),
          }}
        >
          {/* Simple bullet or icon placeholder */}
          {icon !== "in" && icon !== "•"
            ? icon
            : type === "linkedin"
              ? "in"
              : "•"}
        </Text>
        {href ? (
          <Link src={href} style={{ textDecoration: "none" }}>
            <Text style={[contactStyle, { color: getColor("links") }]}>
              {value}
            </Text>
          </Link>
        ) : (
          <Text
            style={[
              contactStyle,
              type === "location" ? { color: getColor("links") } : {},
            ]}
          >
            {value}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ marginBottom: settings.headerBottomMargin ?? 20 }}>
      {/* Profile Image */}
      <ProfileImage
        image={basics.image}
        settings={settings}
        borderColor={getColor("decorations")} // maybe no border in Andrew Kim?
      />

      {/* Name & Title */}
      <Text style={nameStyle}>{basics.name}</Text>
      {basics.label && <Text style={titleStyle}>{basics.label}</Text>}

      {/* Contact Info - Vertical Stack */}
      <View style={{ marginTop: 8 }}>
        {basics.location.city &&
          renderContactItem(
            `${basics.location.city}${basics.location.country ? `, ${basics.location.country}` : ""}`,
            "location",
          )}
        {renderContactItem(basics.email, "email", `mailto:${basics.email}`)}
        {renderContactItem(basics.phone, "phone", `tel:${basics.phone}`)}
        {basics.url &&
          renderContactItem(
            basics.url.replace(/^https?:\/\//, ""),
            "web",
            basics.url,
          )}

        {basics.profiles.map((profile, index) => (
          <React.Fragment key={index}>
            {renderContactItem(
              profile.username || profile.network,
              profile.network.toLowerCase(),
              profile.url,
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};
