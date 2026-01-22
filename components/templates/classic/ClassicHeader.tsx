import React from "react";
import { View, Text, Image, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PROFILE_IMAGE_SIZES } from "@/lib/template-utils";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ClassicHeaderProps {
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
    // @react-pdf/renderer Image does not support alt prop
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
        marginBottom: 10,
      }}
    />
  );
};

export const ClassicHeader: React.FC<ClassicHeaderProps> = ({
  basics,
  settings,
  styles,
  getColor,
  baseFont,
  boldFont,
  italicFont,
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
  };

  const layoutHeaderPos = settings.headerPosition;
  const headerAlign =
    layoutHeaderPos === "left" || layoutHeaderPos === "right"
      ? layoutHeaderPos
      : "center";

  // Recalculate isRight/isCenter based on the processed headerAlign which defaults to center
  const effectiveIsRight = headerAlign === "right";
  const effectiveIsCenter = headerAlign === "center";

  const contactLayout = settings.personalDetailsArrangement;

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
              style={[contactStyle, isLink ? { color: getColor("links") } : {}]}
            >
              {value}
            </Text>
          </Link>
        ) : (
          <Text
            style={[contactStyle, isLink ? { color: getColor("links") } : {}]}
          >
            {value}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.header,
        {
          flexDirection: "row",
          alignItems: effectiveIsCenter ? "center" : "flex-start",
          justifyContent: effectiveIsCenter
            ? "center"
            : effectiveIsRight
              ? "flex-end"
              : "flex-start",
          gap: 20,
        },
      ]}
    >
      {!effectiveIsRight && (
        <ProfileImage
          image={basics.image}
          settings={settings}
          borderColor={getColor("decorations", "#333")}
        />
      )}

      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: getColor("name") }]}>
          {basics.name || "YOUR NAME"}
        </Text>
        {basics.label && (
          <Text style={[styles.label, { color: getColor("title", "#666666") }]}>
            {basics.label}
          </Text>
        )}

        <View
          style={[
            styles.contactRow,
            contactLayout === 2
              ? {
                  flexDirection: "column",
                  gap: 4,
                  alignItems: effectiveIsCenter
                    ? "center"
                    : effectiveIsRight
                      ? "flex-end"
                      : "flex-start",
                }
              : {},
          ]}
        >
          {/* Email */}
          {basics.email &&
            (contactLayout === 2 ? (
              renderContactItem(basics.email, true, `mailto:${basics.email}`)
            ) : (
              <Link
                src={`mailto:${basics.email}`}
                style={{ textDecoration: "none" }}
              >
                <Text style={[contactStyle, { color: getColor("links") }]}>
                  {basics.email}
                </Text>
              </Link>
            ))}

          {/* Phone */}
          {basics.phone &&
            (contactLayout === 2 ? (
              renderContactItem(basics.phone, false, `tel:${basics.phone}`)
            ) : (
              <>
                <Text style={{ color: getColor("decorations") }}>
                  {settings.contactSeparator === "dash"
                    ? " - "
                    : settings.contactSeparator === "comma"
                      ? ", "
                      : " | "}
                </Text>
                <Link
                  src={`tel:${basics.phone}`}
                  style={{ textDecoration: "none" }}
                >
                  <Text style={[contactStyle, { color: getColor("links") }]}>
                    {basics.phone}
                  </Text>
                </Link>
              </>
            ))}

          {/* Location */}
          {basics.location.city &&
            (contactLayout === 2 ? (
              renderContactItem(
                `${basics.location.city}${
                  basics.location.country ? `, ${basics.location.country}` : ""
                }`,
                true,
              )
            ) : (
              <>
                <Text style={{ color: getColor("decorations") }}>
                  {settings.contactSeparator === "dash"
                    ? " - "
                    : settings.contactSeparator === "comma"
                      ? ", "
                      : " | "}
                </Text>
                <Text style={[contactStyle, { color: getColor("links") }]}>
                  {basics.location.city}
                  {basics.location.country
                    ? `, ${basics.location.country}`
                    : ""}
                </Text>
              </>
            ))}

          {/* URL */}
          {basics.url &&
            (contactLayout === 2 ? (
              renderContactItem(basics.url, true, basics.url)
            ) : (
              <>
                <Text style={{ color: getColor("decorations") }}>
                  {settings.contactSeparator === "dash"
                    ? " - "
                    : settings.contactSeparator === "comma"
                      ? ", "
                      : " | "}
                </Text>
                <Link src={basics.url} style={{ textDecoration: "none" }}>
                  <Text style={[contactStyle, { color: getColor("links") }]}>
                    {basics.url.replace(/^https?:\/\//, "")}
                  </Text>
                </Link>
              </>
            ))}

          {/* Profiles */}
          {basics.profiles?.map((p) => {
            const url =
              p.url ||
              (p.username && p.network
                ? `https://${p.network.toLowerCase()}.com/${p.username.replace(
                    /^@/,
                    "",
                  )}`
                : undefined);
            const cleanUrl = url
              ? url.replace(/^https?:\/\//, "").replace(/^www\./, "")
              : null;
            // Display "Network: URL" if network is available, otherwise just URL or username
            const label = cleanUrl
              ? p.network
                ? `${p.network}: ${cleanUrl}`
                : cleanUrl
              : p.username || p.network;

            return contactLayout === 2 ? (
              <View key={p.network + label}>
                {renderContactItem(label, true, url)}
              </View>
            ) : (
              <View key={p.network + label} style={{ flexDirection: "row" }}>
                <Text style={{ color: getColor("decorations") }}>
                  {settings.contactSeparator === "dash"
                    ? " - "
                    : settings.contactSeparator === "comma"
                      ? ", "
                      : " | "}
                </Text>
                {url ? (
                  <Link src={url} style={{ textDecoration: "none" }}>
                    <Text style={[contactStyle, { color: getColor("links") }]}>
                      {label}
                    </Text>
                  </Link>
                ) : (
                  <Text style={[contactStyle, { color: getColor("links") }]}>
                    {label}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {effectiveIsRight && (
        <ProfileImage
          image={basics.image}
          settings={settings}
          borderColor={getColor("decorations", "#333")}
        />
      )}
    </View>
  );
};
