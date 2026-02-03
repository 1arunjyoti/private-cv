import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CertificatesForm } from "@/components/forms/CertificatesForm";
import type { Certificate } from "@/db";

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid-cert"),
}));

// Mock RichTextEditor
vi.mock("@/components/ui/RichTextEditor", () => ({
  RichTextEditor: ({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder?: string; id?: string }) => (
    <textarea
      data-testid="rich-text-editor"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

describe("CertificatesForm", () => {
  const mockOnChange = vi.fn();

  const createCertificate = (overrides?: Partial<Certificate>): Certificate => ({
    id: "cert-1",
    name: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2024-01-15",
    url: "https://aws.amazon.com/certification",
    summary: "Professional level certification",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no certificates", () => {
      render(<CertificatesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText(/no certificates added/i)).toBeDefined();
    });

    it("should render the Certificates heading", () => {
      render(<CertificatesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Certificates")).toBeDefined();
    });

    it("should render Add Certificate button", () => {
      render(<CertificatesForm data={[]} onChange={mockOnChange} />);

      expect(screen.getByText("Add Certificate")).toBeDefined();
    });

    it("should render certificate entries", () => {
      const certs = [createCertificate()];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      expect(screen.getByText("AWS Solutions Architect")).toBeDefined();
    });

    it("should render certificate number", () => {
      const certs = [createCertificate()];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      expect(screen.getByText("#1")).toBeDefined();
    });

    it("should display New Certificate for unnamed certificates", () => {
      const certs = [createCertificate({ name: "" })];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      expect(screen.getByText("New Certificate")).toBeDefined();
    });

    it("should render multiple certificates", () => {
      const certs = [
        createCertificate({ id: "1", name: "AWS Cert" }),
        createCertificate({ id: "2", name: "Azure Cert" }),
      ];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      expect(screen.getByText("AWS Cert")).toBeDefined();
      expect(screen.getByText("Azure Cert")).toBeDefined();
    });
  });

  describe("adding certificates", () => {
    it("should add a new certificate when Add Certificate is clicked", async () => {
      const user = userEvent.setup();
      render(<CertificatesForm data={[]} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Certificate"));

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: "mock-uuid-cert",
          name: "",
          issuer: "",
          date: "",
          url: "",
          summary: "",
        }),
      ]);
    });

    it("should append to existing certificates", async () => {
      const user = userEvent.setup();
      const existingCerts = [createCertificate()];
      render(<CertificatesForm data={existingCerts} onChange={mockOnChange} />);

      await user.click(screen.getByText("Add Certificate"));

      expect(mockOnChange).toHaveBeenCalledWith([
        existingCerts[0],
        expect.objectContaining({
          id: "mock-uuid-cert",
        }),
      ]);
    });
  });

  describe("removing certificates", () => {
    it("should remove a certificate when delete button is clicked", async () => {
      const user = userEvent.setup();
      const certs = [createCertificate()];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      const removeButton = screen.getByLabelText("Remove certificate");
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("should remove only the targeted certificate", async () => {
      const user = userEvent.setup();
      const certs = [
        createCertificate({ id: "1", name: "First" }),
        createCertificate({ id: "2", name: "Second" }),
      ];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      const removeButtons = screen.getAllByLabelText("Remove certificate");
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([certs[1]]);
    });
  });

  describe("updating certificates", () => {
    it("should update certificate name", async () => {
      const user = userEvent.setup();
      const certs = [createCertificate({ name: "" })];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      const nameInput = screen.getByLabelText(/certificate name/i);
      await user.type(nameInput, "New Cert Name");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update issuer", async () => {
      const user = userEvent.setup();
      const certs = [createCertificate({ issuer: "" })];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      const issuerInput = screen.getByLabelText(/issuer/i);
      await user.type(issuerInput, "Google");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update date", async () => {
      const user = userEvent.setup();
      const certs = [createCertificate({ date: "" })];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      const dateInput = screen.getByLabelText(/date/i);
      await user.type(dateInput, "2024-06-15");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update URL", async () => {
      const user = userEvent.setup();
      const certs = [createCertificate({ url: "" })];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      const urlInput = screen.getByLabelText(/url/i);
      await user.type(urlInput, "https://cert.example.com");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should update description", async () => {
      const user = userEvent.setup();
      const certs = [createCertificate({ summary: "" })];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      const summaryEditor = screen.getByTestId("rich-text-editor");
      await user.type(summaryEditor, "New description");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have accessible labels for inputs", () => {
      const certs = [createCertificate()];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      expect(screen.getByLabelText(/certificate name/i)).toBeDefined();
      expect(screen.getByLabelText(/issuer/i)).toBeDefined();
      expect(screen.getByLabelText(/date/i)).toBeDefined();
      expect(screen.getByLabelText(/url/i)).toBeDefined();
      expect(screen.getByLabelText(/description/i)).toBeDefined();
    });

    it("should have accessible remove button", () => {
      const certs = [createCertificate()];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      expect(screen.getByLabelText("Remove certificate")).toBeDefined();
    });
  });

  describe("form fields", () => {
    it("should have placeholder for certificate name", () => {
      const certs = [createCertificate({ name: "" })];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/aws certified/i)).toBeDefined();
    });

    it("should have placeholder for issuer", () => {
      const certs = [createCertificate({ issuer: "" })];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      expect(screen.getByPlaceholderText(/amazon web services/i)).toBeDefined();
    });

    it("should have date input type", () => {
      const certs = [createCertificate()];
      render(<CertificatesForm data={certs} onChange={mockOnChange} />);

      const dateInput = screen.getByLabelText(/date/i);
      expect(dateInput.getAttribute("type")).toBe("date");
    });
  });
});
