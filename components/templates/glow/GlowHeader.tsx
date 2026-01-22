import React from "react";
import { View, Text, Image, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PROFILE_IMAGE_SIZES } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowHeaderProps {
  basics: Resume["basics"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  baseFont: string;
  boldFont: string;
  italicFont: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
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
        borderWidth: settings.profileImageBorder ? 2 : 0,
        borderColor: borderColor,
        objectFit: "cover",
        marginBottom: 10,
      }}
    />
  );
};

export const GlowHeader: React.FC<GlowHeaderProps> = ({
  basics,
  settings,
  styles,
  getColor,
  baseFont,
  boldFont,
  italicFont,
  headerBackgroundColor = "#202020",
  headerTextColor = "#FFFFFF",
}) => {
  const contactStyle = {
    fontWeight: (settings.contactBold ? "bold" : "normal") as "bold" | "normal",
    fontStyle: (settings.contactItalic ? "italic" : "normal") as
      | "italic"
      | "normal",
    fontFamily: settings.contactBold
      ? boldFont
      : settings.contactItalic
        ? italicFont
        : baseFont,
    color: headerTextColor,
  };

  const layoutHeaderPos = settings.headerPosition;
  const headerAlign =
    layoutHeaderPos === "left" || layoutHeaderPos === "right"
      ? layoutHeaderPos
      : "left"; // Default to left for Glow

  const contactLayout = settings.personalDetailsArrangement;

  const mapAlignToFlex = (align: string) => {
    switch (align) {
      case "right":
        return "flex-end";
      case "center":
        return "center";
      case "left":
      default:
        return "flex-start";
    }
  };

  const headerFlexAlign = mapAlignToFlex(headerAlign);

  const renderContactItem = (
    value: string,
    isLink: boolean = false,
    href?: string,
  ) => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {href ? (
          <Link src={href} style={{ textDecoration: "none" }}>
            <Text
              style={[
                contactStyle,
                isLink
                  ? { color: getColor("links", headerTextColor) }
                  : { color: headerTextColor },
              ]}
            >
              {value}
            </Text>
          </Link>
        ) : (
          <Text
            style={[
              contactStyle,
              isLink ? { color: getColor("links", headerTextColor) } : {},
            ]}
          >
            {value}
          </Text>
        )}
      </View>
    );
  };

  // Build Contact Items
  const contactItems = [];
  if (basics.email)
    contactItems.push({
      type: "email",
      value: basics.email,
      href: `mailto:${basics.email}`,
    });
  if (basics.phone) contactItems.push({ type: "phone", value: basics.phone });
  if (basics.location && (basics.location.city || basics.location.country)) {
    const loc = [basics.location.city, basics.location.country]
      .filter(Boolean)
      .join(", ");
    contactItems.push({ type: "location", value: loc });
  }
  if (basics.url)
    contactItems.push({ type: "website", value: basics.url, href: basics.url });

  // Add profiles
  if (basics.profiles && basics.profiles.length > 0) {
    basics.profiles.forEach((p) => {
      contactItems.push({
        type: "profile",
        value: p.username || p.network,
        href: p.url,
      });
    });
  }

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: headerBackgroundColor,
          color: headerTextColor,
          padding: 20, // Add padding for the dark box
          marginBottom: settings.headerBottomMargin,
        },
      ]}
    >
      <View
        style={{
          flexDirection: headerAlign === "right" ? "row-reverse" : "row",
          alignItems: "center",
          gap: 20,
        }}
      >
        <ProfileImage
          image={basics.image}
          settings={settings}
          borderColor={getColor("name")} // Use accent color for border
        />

        <View style={{ flex: 1, alignItems: headerFlexAlign }}>
          <Text
            style={[styles.name, { color: getColor("name", headerTextColor) }]}
          >
            {basics.name}
          </Text>
          <Text
            style={[
              styles.label,
              { color: headerTextColor, opacity: 0.9, marginTop: 20 },
            ]}
          >
            {basics.label}
          </Text>

          <View
            style={[
              styles.contactRow,
              {
                justifyContent: headerFlexAlign,
                marginTop: 8,
              },
            ]}
          >
            {contactItems.map((item, index) => (
              <React.Fragment key={index}>
                {renderContactItem(
                  item.value,
                  !!item.href || item.type === "location",
                  item.href,
                )}
                {index < contactItems.length - 1 && (
                  <Text
                    style={{
                      color: getColor("decorations"),
                      marginHorizontal: 4,
                    }}
                  >
                    {contactLayout === 2 ? "" : "|"}
                  </Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
