# PrivateCV

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-2ea44f?style=for-the-badge&logo=vercel)](https://privatecv.vercel.app)

A professional, open-source resume builder that runs entirely in your browser. Built with privacy as the core feature—your data never leaves your device.

![License](https://img.shields.io/badge/license-GPL3.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## 🚀 Features

- **🔒 Privacy by Design**: Zero data collection. No servers, no tracking, no cookies.
- **💾 Local Storage**: All data is stored in your browser's IndexedDB using `Dexie.js`.
- **☁️ Optional BYOS Cloud Sync**: Connect your Google Drive and store backups in your own cloud account (single sync file), with optional passphrase encryption.
- **📶 Offline Capable**: Full PWA support—install it and build resumes without internet.
- **📄 Client-Side PDF**: High-quality PDFs generated instantly in the browser via `@react-pdf/renderer`.
- **🎨 Extensive Template Library** (14+ templates):
  - **ATS Scanner**: Optimized for Applicant Tracking Systems with machine-readable layouts.
  - **Classic**: Timeless serif design with centered header.
  - **Professional**: Modern two-column layout for high-density information.
  - **Modern**: Minimalist, typography-focused single-column design.
  - **Elegant**: Sophisticated design with clean aesthetics.
  - **Creative**: Two-column with sidebar and accent colors.
  - **Classic Slate**: Elegant two-column with bordered sections.
  - **Glow**: High-contrast dark header with modern styling.
  - **Multicolumn**: Dense three-column layout for compact resumes.
  - **Stylish**: Wave header with modern sidebar design.
  - **Timeline**: Timeline-based entry layout with left-aligned dates.
  - **Polished**: Clean design with colored sidebar.
  - **Developer**: Dark theme with code-style aesthetics.
  - **Developer 2**: Vertical name with dark theme and split columns.
- **✨ Advanced Customization**: Full control over typography (7 font families), spacing, accent colors, section ordering, and layout options.
- **📥 Flexible Export**: Download as high-quality **PDF** or multi-page **JPG** (zipped).
- **🎯 Smart Job Matcher**: Compare your resume against job descriptions using N-gram analysis, tech synonym matching, and phrase extraction to optimize keywords.
- **🧠 AI-Powered Career Insights**: 
  - **Career Gap Analysis**: Get intelligent recommendations on skills and experiences to develop.
  - **Consistency Checker**: Verify resume accuracy, spelling, grammar, and content consistency.
  - **LinkedIn Import**: Automatically parse and import your LinkedIn profile data.
- **♿ Accessible**: Fully accessible UI with ARIA support and keyboard navigation.
- **🌓 Dark Mode**: Seamless dark/light theme switching.
- **📱 Responsive**: Works seamlessly on desktop, tablet, and mobile.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with persist middleware
- **AI Integration**: OpenAI, Claude, Gemini, and Local llm model support for career insights and resume optimization
- **Testing**: [Vitest](https://vitest.dev/)

## 🏃‍♂️ Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/resume-builder.git
   cd resume-builder
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Running Tests

We use [Vitest](https://vitest.dev/) for unit and integration testing.

```bash
npm run test
```

## ☁️ Cloud Sync Setup (Optional)

Enable BYOS cloud sync with:

```bash
NEXT_PUBLIC_ENABLE_CLOUD_SYNC=true
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your_google_oauth_client_id
```

Use a Google OAuth client configured for browser PKCE flow and add your app URL as an authorized redirect origin.

## 📜 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](license) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### For Code Contributions
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### For Template Contributions
We use a factory-based template system that makes it easy to create new templates with minimal code (~20-50 lines vs 500+ lines). See our comprehensive template development guide:
- **[Template Development Guide](docs/TEMPLATE_GUIDE.md)** - Complete guide for creating and modifying templates, with configuration reference, presets, and examples.

New templates can be created by selecting from reusable presets (typography, headings, layouts, etc.) and adding custom overrides as needed.
