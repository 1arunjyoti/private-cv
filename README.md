# Privacy-First Resume Builder

A professional, open-source resume builder that runs entirely in your browser. Built with privacy as the core feature—your data never leaves your device.

![License](https://img.shields.io/badge/license-GPL3.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## 🚀 Features

- **🔒 Privacy by Design**: Zero data collection. No servers, no tracking, no cookies.
- **💾 Local Storage**: All data is stored in your browser's IndexedDB using `Dexie.js`.
- **📶 Offline Capable**: Full PWA support—install it and build resumes without internet.
- **📄 Client-Side PDF**: High-quality PDFs generated instantly in the browser via `@react-pdf/renderer`.
- **🎨 Template Catalog**:
  - **ATS Scanner**: Optimized for Applicant Tracking Systems.
  - **Creative**: Modern two-column layout.
  - **Professional**: Executive serif style.
  - **Elegant**: Sophisticated full-width banner design.
  - **Modern**: Minimalist typography focus.
- **🎯 Job Matcher**: Compare your resume against job descriptions to optimize keywords.
- **📱 Responsive**: Works seamlessly on desktop, tablet, and mobile.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with persist middleware

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

## 📜 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](license) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
