import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { Resume } from "@/db";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowSkillsProps {
  skills: Resume["skills"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
  lineHeight: number;
}

export const GlowSkills: React.FC<GlowSkillsProps> = ({
  skills,
  settings,
  styles,
  getColor,
  fontSize,
  boldFont,
  // italicFont, // Unused
}) => {
  if (!skills || skills.length === 0) return null;

  // Group into columns if we want to mimic the reference image
  // For now simple list or grid based on settings
  
  return (
    <View key="skills" style={styles.section}>
      {((settings.skillsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            SKILLS
          </Text>
        </View>
      )}
      
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}>
          {skills.map((skill) => (
            <View key={skill.id} style={{ width: "48%", marginBottom: 6 }}>
                <Text style={{ fontSize: fontSize, fontFamily: boldFont, fontWeight: "bold" }}>
                    {skill.name}
                </Text>
                {skill.level && (
                    <Text style={{ fontSize: fontSize - 1, color: "#555", marginBottom: 2 }}>
                        {skill.level}
                    </Text>
                )}
                 {skill.keywords && skill.keywords.length > 0 && (
                    <Text style={{ fontSize: fontSize, color: "#333", lineHeight: 1.3 }}>
                      {settings.skillsListStyle === "bullet" 
                        ? skill.keywords.map(k => "• " + k).join("\n") 
                        : skill.keywords.join(", ")}
                    </Text>
                 )}
            </View>
          ))}
      </View>
    </View>
  );
};
