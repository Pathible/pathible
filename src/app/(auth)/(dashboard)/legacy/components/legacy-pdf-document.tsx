import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#333",
  },
  header: {
    marginBottom: 30,
    textAlign: "center",
    borderBottom: "2px solid #4B7F52",
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4B7F52",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  date: {
    fontSize: 10,
    color: "#888",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B7F52",
    marginBottom: 8,
    borderBottom: "1px solid #ddd",
    paddingBottom: 4,
  },
  sectionDescription: {
    fontSize: 10,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  sectionContent: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#333",
    whiteSpace: "pre-wrap",
  },
  contactsSection: {
    marginBottom: 24,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B7F52",
    marginBottom: 12,
    borderBottom: "1px solid #ddd",
    paddingBottom: 4,
  },
  contactCard: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  contactName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  contactRole: {
    fontSize: 10,
    color: "#4B7F52",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  contactDetail: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#888",
    borderTop: "1px solid #ddd",
    paddingTop: 10,
  },
  disclaimer: {
    marginTop: 30,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});

interface KeyContact {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface LegacyPDFData {
  trustedContacts?: string;
  guardians?: string;
  petCare?: string;
  memorial?: string;
  finalMessage?: string;
  keyContacts: KeyContact[];
  userName: string;
  householdName: string;
  lastUpdated: Date | null;
}

const formatRole = (role: string): string => {
  const roleLabels: Record<string, string> = {
    attorney: "Attorney",
    financial_advisor: "Financial Advisor",
    executor: "Executor",
    trustee: "Trustee",
    guardian: "Guardian",
    healthcare_proxy: "Healthcare Proxy",
    other: "Other",
  };
  return roleLabels[role] || role;
};

export function LegacyPDFDocument({ data }: { data: LegacyPDFData }) {
  const formattedDate = data.lastUpdated
    ? data.lastUpdated.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Legacy Plan Summary</Text>
          <Text style={styles.subtitle}>{data.householdName}</Text>
          <Text style={styles.date}>Last updated: {formattedDate}</Text>
        </View>

        {/* Trusted Contacts Section */}
        {data.trustedContacts && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trusted Contacts</Text>
            <Text style={styles.sectionDescription}>The people you&apos;re counting on</Text>
            <Text style={styles.sectionContent}>{data.trustedContacts}</Text>
          </View>
        )}

        {/* Guardianship Section */}
        {data.guardians && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guardianship Preferences</Text>
            <Text style={styles.sectionDescription}>
              Who you&apos;d trust with what matters most
            </Text>
            <Text style={styles.sectionContent}>{data.guardians}</Text>
          </View>
        )}

        {/* Pet Care Section */}
        {data.petCare && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pet Care Instructions</Text>
            <Text style={styles.sectionDescription}>Caring for your beloved companions</Text>
            <Text style={styles.sectionContent}>{data.petCare}</Text>
          </View>
        )}

        {/* Memorial Section */}
        {data.memorial && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Memorial Preferences</Text>
            <Text style={styles.sectionDescription}>The celebration of your life</Text>
            <Text style={styles.sectionContent}>{data.memorial}</Text>
          </View>
        )}

        {/* Final Message Section */}
        {data.finalMessage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Blessing</Text>
            <Text style={styles.sectionDescription}>The words you want them to carry</Text>
            <Text style={styles.sectionContent}>{data.finalMessage}</Text>
          </View>
        )}

        {/* Key Contacts Section */}
        {data.keyContacts.length > 0 && (
          <View style={styles.contactsSection}>
            <Text style={styles.contactsTitle}>Key Contacts</Text>
            {data.keyContacts.map((contact) => (
              <View key={`${contact.name}-${contact.role}`} style={styles.contactCard}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRole}>{formatRole(contact.role)}</Text>
                {contact.phone && <Text style={styles.contactDetail}>Phone: {contact.phone}</Text>}
                {contact.email && <Text style={styles.contactDetail}>Email: {contact.email}</Text>}
                {contact.address && (
                  <Text style={styles.contactDetail}>Address: {contact.address}</Text>
                )}
                {contact.notes && <Text style={styles.contactDetail}>Notes: {contact.notes}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This document is a personal legacy summary created through Pathible. It is not a legal
            document and should not replace professional legal or financial advice. For official
            estate planning, please consult with qualified professionals.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Pathible | pathible.com</Text>
        </View>
      </Page>
    </Document>
  );
}
