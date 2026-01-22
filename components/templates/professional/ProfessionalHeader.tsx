import React from "react";
import { View, Text, Image, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PROFILE_IMAGE_SIZES } from "@/lib/template-utils";
import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface ProfessionalHeaderProps {
  basics: Resume["basics"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  baseFont: string;
  boldFont: string;
  italicFont: string;
  fontSize: number;
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
  const size = PROFILE_IMAGE_SIZES[settings.profileImageSize || "M"];
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
        marginBottom: 10,
      }}
    />
  );
};

export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({
  basics,
  settings,
  styles,
  getColor,
  baseFont,
  boldFont,
  italicFont,
  fontSize,
}) => {
  const layoutHeaderPos = settings.headerPosition || "left";
  const headerAlign =
    layoutHeaderPos === "left" || layoutHeaderPos === "right"
      ? layoutHeaderPos
      : "center";

  const isRight = headerAlign === "right";
  const isCenter = headerAlign === "center";
  const contactLayout = settings.personalDetailsArrangement;

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
    fontSize: settings.contactFontSize || fontSize,
  };

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
          alignItems: isCenter ? "center" : "flex-start",
          justifyContent: isCenter
            ? "center"
            : isRight
              ? "flex-end"
              : "flex-start",
          gap: 20,
        },
      ]}
    >
      {!isRight && (
        <ProfileImage
          image={basics.image}
          settings={settings}
          borderColor={getColor("decorations")}
        />
      )}

      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { textAlign: headerAlign }]}>
          {basics.name}
        </Text>
        <Text style={[styles.title, { textAlign: headerAlign }]}>
          {basics.label}
        </Text>

        <View
          style={[
            styles.contactRow,
            contactLayout === 2
              ? {
                  flexDirection: "column",
                  gap: 4,
                  alignItems: isCenter
                    ? "center"
                    : isRight
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
                `${basics.location.city}${basics.location.country ? `, ${basics.location.country}` : ""}`,
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
            const url = p.url;
            const label = p.network;
            return contactLayout === 2 ? (
              <View key={p.network}>{renderContactItem(label, true, url)}</View>
            ) : (
              <View key={p.network} style={{ flexDirection: "row" }}>
                <Text style={{ color: getColor("decorations") }}>
                  {settings.contactSeparator === "dash"
                    ? " - "
                    : settings.contactSeparator === "comma"
                      ? ", "
                      : " | "}
                </Text>
                <Link src={url} style={{ textDecoration: "none" }}>
                  <Text style={[contactStyle, { color: getColor("links") }]}>
                    {label}
                  </Text>
                </Link>
              </View>
            );
          })}
        </View>
      </View>

      {isRight && (
        <ProfileImage
          image={basics.image}
          settings={settings}
          borderColor={getColor("decorations")}
        />
      )}
    </View>
  );
};
