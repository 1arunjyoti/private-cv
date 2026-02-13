# PrivateCV

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-2ea44f?style=for-the-badge&logo=vercel)](https://privatecv.vercel.app)

A professional, open-source resume builder that runs entirely in your browser. Built with privacy as the core feature—your data never leaves your device.

![License](https://img.shields.io/badge/license-GPL3.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## 🚀 Features

### Core Privacy & Storage
- **🔒 Privacy by Design**: Zero data collection. No servers, no tracking, no cookies.
- **💾 Local Storage**: All data is stored in your browser's IndexedDB using `Dexie.js`.
- **☁️ Optional BYOS Cloud Sync**: Connect your Google Drive and store backups in your own cloud account (single sync file), with optional passphrase encryption.
- **📶 Offline Capable**: Full PWA support—install it and build resumes without internet.
- **🌓 Dark Mode**: Seamless dark/light theme switching.
- **♿ Accessible**: Fully accessible UI with ARIA support and keyboard navigation.
- **📱 Responsive**: Works seamlessly on desktop, tablet, and mobile.

### Import & Export
- **📥 Smart Import**: Import from PDF, DOCX, JSON, or LinkedIn CSV exports with intelligent parsing.
- **📄 PDF Export**: High-quality PDFs generated instantly in the browser via `@react-pdf/renderer`.
- **📝 DOCX Export**: Download as fully-formatted Microsoft Word documents.
- **📸 JPG Export**: Multi-page high-resolution JPEG exports (zipped).
- **💾 JSON Backup**: Save and restore your resume data as JSON.

### Resume Management
- **📊 Dashboard**: Manage multiple resumes with version control and quick access.
- **⚙️ Settings Page**: Configure AI providers, cloud sync, theme, and advanced preferences.
- **🖼️ Photo Background Removal**: AI-powered background removal for profile photos.
- **🎨 Extensive Template Library** (14 templates):
  - **ATS Scanner**: Single-column layout optimized for Applicant Tracking Systems with machine-readable formatting.
  - **Classic**: Timeless structured design excellent for academic and traditional industries.
  - **Professional**: Modern two-column layout for high-density information, ideal for experienced professionals.
  - **Modern Minimalist**: Sleek, typography-focused single-column design.
  - **Elegant Banner**: Sophisticated design with full-width header banner.
  - **Creative Sidebar**: Two-column with colored sidebar, skill bars, and vibrant personality.
  - **Classic Slate**: Elegant two-column with sophisticated bordered sections and clean typography.
  - **Glow**: High-contrast dark header with vibrant accents, perfect for tech professionals.
  - **Multicolumn**: Clean three-column layout for highlighting skills and education alongside experience.
  - **Stylish**: Modern two-column with wave header and sidebar design.
  - **Timeline**: Timeline-based entry layout with creative left-aligned dates.
  - **Polished**: Clean design with colored sidebar and modern aesthetics.
  - **Developer**: Dark theme with two-column sidebar layout for tech roles.
  - **Developer 2**: Distinctive dark theme with numbered sections and vertical typography.

### Customization & Tools
- **✨ Advanced Customization**: Full control over typography (7 font families), spacing, accent colors, section ordering, and layout options.
- **🎯 Smart Job Matcher**: Compare your resume against job descriptions using N-gram analysis, tech synonym matching, and phrase extraction to optimize keywords.
- **📊 AI-Enhanced ATS Score**: Get detailed ATS compatibility analysis with actionable feedback and recommendations.

### AI-Powered Career Insights
- **🧠 Career Gap Analysis**: Receive intelligent recommendations on skills and experiences to develop for your target role.
- **✅ Consistency Checker**: Verify resume accuracy, spelling, grammar, and content consistency with AI.
- **🔗 LinkedIn Import**: Automatically parse and import your LinkedIn profile data from CSV exports.
- **🤖 Multi-Provider Support**: Works with OpenAI (GPT-4.1, GPT-5), Anthropic (Claude Haiku/Sonnet/Opus 4.5), Google (Gemini 2.5/3), and local LLM models.

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & shadcn/ui
- **Database**: Dexie.js (IndexedDB wrapper)
- **PDF Generation**: @react-pdf/renderer
- **DOCX Generation**: docx.js
- **Document Parsing**: unpdf, mammoth, pdfjs-dist
- **Image Processing**: @imgly/background-removal for AI-powered photo background removal
- **Drag & Drop**: @dnd-kit
- **State Management**: Zustand with persist middleware
- **AI Integration**: OpenAI, Claude, Gemini, and Local LLM model support for career insights and resume optimization
- **Analytics**: Microsoft Clarity (anonymous)
- **Testing**: Vitest

## 🏃‍♂️ Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/1arunjyoti/private-cv.git
   cd private-cv
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

5. **Learn how to use it**
   Visit the [How to Use](http://localhost:3000/how-to-use) guide for step-by-step instructions on building your perfect resume.

## 🧪 Running Tests

We use [Vitest](https://vitest.dev/) for unit and integration testing.

```bash
npm run test
```

## 🤖 AI Features Setup (Optional)

To enable AI-powered career insights (Career Gap Analysis, Consistency Checker, ATS Enhancement):

1. Navigate to **Settings** (`/settings`) in the app
2. Choose your preferred AI provider:
   - **OpenAI**: Requires API key from [platform.openai.com](https://platform.openai.com)
   - **Anthropic**: Requires API key from [console.anthropic.com](https://console.anthropic.com)
   - **Google Gemini**: Requires API key from [aistudio.google.com](https://aistudio.google.com)
   - **Local Models**: Configure custom endpoint for self-hosted LLMs
3. Configure your model preferences and API key
4. All AI analysis happens client-side; your API key stays in your browser

> **Privacy Note**: When using AI features, resume content is sent to your chosen provider's API. Your API keys are stored locally in your browser and never sent to our servers.

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
