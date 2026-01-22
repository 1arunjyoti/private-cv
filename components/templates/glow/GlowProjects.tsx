import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { Resume } from "@/db";
import { PDFRichText } from "../PDFRichText";

import { LayoutSettings, TemplateStyles } from "@/components/design/types";

interface GlowProjectsProps {
  projects: Resume["projects"];
  settings: LayoutSettings;
  styles: TemplateStyles;
  getColor: (target: string, fallback?: string) => string;
  fontSize: number;
  baseFont: string;
  boldFont: string;
  italicFont: string;
}

export const GlowProjects: React.FC<GlowProjectsProps> = ({
  projects,
  settings,
  styles,
  getColor,
  fontSize,
  baseFont,
  boldFont,
  italicFont,
}) => {
  if (!projects || projects.length === 0) return null;

  return (
    <View key="projects" style={styles.section}>
      {((settings.projectsHeadingVisible ?? true) as boolean) && (
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: getColor("headings") }]}>
            PROJECTS
          </Text>
        </View>
      )}
      {projects.map((project) => (
        <View key={project.id} style={styles.entryBlock}>
           <View style={styles.entryHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                 <Text
                    style={[
                      styles.entryTitle,
                      {
                        fontSize: fontSize + 1,
                        fontFamily: boldFont,
                        fontWeight: "bold"
                      },
                    ]}
                  >
                    {project.name}
                  </Text>
                  {project.url && (
                    <Link src={project.url} style={{ textDecoration: "none" }}>
                      <Text style={{ fontSize: fontSize - 2, color: getColor("links"), marginLeft: 5 }}>
                         ↗
                      </Text>
                    </Link>
                  )}
              </View>
              <Text style={[styles.entrySubtitle, { fontFamily: italicFont, fontStyle: "italic", color: "#444" }]}>
                  {project.description}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.entryDate, { color: getColor("dates", getColor("headings")) }]}>
                   {project.startDate} {project.endDate ? `– ${project.endDate}` : ""}
                </Text>
            </View>
          </View>
          
          <View style={styles.entrySummary}>
             {project.description && (
               <PDFRichText 
                  text={project.description}
                  style={{
                    fontSize: fontSize,
                    fontFamily: baseFont,
                    marginBottom: 4
                  }}
               />
             )}
             {project.highlights && project.highlights.length > 0 && (
                <View style={{ marginTop: 2 }}>
                  {project.highlights.map((highlight, idx) => (
                    <Text key={idx} style={{ fontSize, fontFamily: baseFont }}>
                      • {highlight}
                    </Text>
                  ))}
                </View>
             )}
          </View>
        </View>
      ))}
    </View>
  );
};
