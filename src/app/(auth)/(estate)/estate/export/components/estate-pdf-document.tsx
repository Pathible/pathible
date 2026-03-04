"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { EstateSummaryData, ExportSection } from "@/lib/estate-export";
import { formatLabel } from "@/lib/estate-export";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
  },
  coverPage: {
    padding: 40,
    fontFamily: "Helvetica",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  coverContent: {
    textAlign: "center",
    marginTop: 180,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4B7F52",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  coverDetail: {
    fontSize: 11,
    color: "#444",
    marginBottom: 4,
  },
  coverExecutor: {
    fontSize: 11,
    color: "#666",
    marginTop: 16,
    fontStyle: "italic",
  },
  header: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: "2px solid #4B7F52",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B7F52",
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#888",
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4B7F52",
    marginBottom: 8,
    borderBottom: "1px solid #ddd",
    paddingBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #ccc",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5px solid #eee",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#444",
  },
  tableCell: {
    fontSize: 8,
    color: "#333",
  },
  checklistItem: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#999",
    marginRight: 6,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#4B7F52",
  },
  checklistText: {
    flex: 1,
    fontSize: 9,
  },
  checklistCategory: {
    fontSize: 8,
    color: "#888",
    width: 100,
  },
  checklistNotes: {
    fontSize: 7,
    color: "#666",
    marginLeft: 16,
    marginBottom: 2,
    fontStyle: "italic",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: "#666",
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: "#888",
    borderTop: "1px solid #ddd",
    paddingTop: 6,
  },
  watermark: {
    position: "absolute",
    bottom: 40,
    right: 40,
    fontSize: 7,
    color: "#ccc",
  },
  guidanceTip: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f0f7f1",
    borderLeft: "3px solid #4B7F52",
  },
  guidanceTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4B7F52",
    marginBottom: 2,
  },
  guidanceText: {
    fontSize: 8,
    color: "#555",
    lineHeight: 1.4,
  },
});

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface EstatePDFDocumentProps {
  data: EstateSummaryData;
  sections: ExportSection[];
}

export function EstatePDFDocument({ data, sections }: EstatePDFDocumentProps) {
  const totalAssetValue = data.assets.reduce((sum, a) => sum + (a.estimatedValue ?? 0), 0);
  const totalDistValue = data.distributions.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const checklistCompleted = data.checklistItems.filter((i) => i.isCompleted).length;

  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.coverContent}>
          <Text style={styles.coverTitle}>Estate Summary Report</Text>
          <Text style={styles.coverSubtitle}>Estate of {data.activation.deceasedName}</Text>

          {data.activation.dateOfDeath && (
            <Text style={styles.coverDetail}>
              Date of Death: {formatDate(data.activation.dateOfDeath)}
            </Text>
          )}
          <Text style={styles.coverDetail}>Status: {formatLabel(data.activation.status)}</Text>
          <Text style={styles.coverDetail}>
            Administration Began: {formatDate(data.activation.activatedAt)}
          </Text>
          {data.activation.completedAt && (
            <Text style={styles.coverDetail}>
              Completed: {formatDate(data.activation.completedAt)}
            </Text>
          )}

          <Text style={styles.coverExecutor}>Executor: {data.executorName}</Text>
          <Text style={{ fontSize: 9, color: "#888", marginTop: 24 }}>
            Generated {formatDate(data.generatedAt)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Generated by Pathible — not legal advice</Text>
        </View>
        <View style={styles.watermark}>
          <Text>Prepared by {data.executorName}</Text>
        </View>
      </Page>

      {/* Checklist Section */}
      {sections.includes("checklist") && data.checklistItems.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Estate of {data.activation.deceasedName}</Text>
            <Text style={styles.headerSubtitle}>Checklist Status</Text>
          </View>

          <View style={styles.guidanceTip}>
            <Text style={styles.guidanceTitle}>For your attorney</Text>
            <Text style={styles.guidanceText}>
              This checklist shows the status of administrative tasks. Share this with your attorney
              to confirm all legal obligations have been met.
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Tasks</Text>
            <Text style={styles.summaryValue}>{data.checklistItems.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>
              {checklistCompleted} of {data.checklistItems.length}
            </Text>
          </View>
          <View style={{ marginBottom: 12 }} />

          {data.checklistItems.map((item) => (
            <View key={`${item.category}-${item.title}`}>
              <View style={styles.checklistItem}>
                <View style={styles.checkbox}>
                  <Text style={styles.checkmark}>{item.isCompleted ? "X" : ""}</Text>
                </View>
                <Text style={styles.checklistText}>{item.title}</Text>
                <Text style={styles.checklistCategory}>{formatLabel(item.category)}</Text>
              </View>
              {item.notes && <Text style={styles.checklistNotes}>Note: {item.notes}</Text>}
            </View>
          ))}

          <View style={styles.footer}>
            <Text>Generated by Pathible — not legal advice</Text>
          </View>
        </Page>
      )}

      {/* Assets Section */}
      {sections.includes("assets") && data.assets.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Estate of {data.activation.deceasedName}</Text>
            <Text style={styles.headerSubtitle}>Asset Inventory</Text>
          </View>

          <View style={styles.guidanceTip}>
            <Text style={styles.guidanceTitle}>For your accountant</Text>
            <Text style={styles.guidanceText}>
              This inventory lists all identified estate assets with their estimated values and
              current status. Use this for tax filing and estate valuation purposes.
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Assets</Text>
            <Text style={styles.summaryValue}>{data.assets.length}</Text>
          </View>
          {totalAssetValue > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Estimated Value</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalAssetValue)}</Text>
            </View>
          )}
          <View style={{ marginBottom: 8 }} />

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "25%" }]}>Name</Text>
            <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Category</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Value</Text>
            <Text style={[styles.tableHeaderCell, { width: "15%" }]}>Institution</Text>
            <Text style={[styles.tableHeaderCell, { width: "12%" }]}>Beneficiary</Text>
          </View>
          {data.assets.map((asset) => (
            <View key={`${asset.category}-${asset.name}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "25%" }]}>{asset.name}</Text>
              <Text style={[styles.tableCell, { width: "18%" }]}>
                {formatLabel(asset.category)}
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>{formatLabel(asset.status)}</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>
                {asset.estimatedValue != null ? formatCurrency(asset.estimatedValue) : "—"}
              </Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>{asset.institution ?? "—"}</Text>
              <Text style={[styles.tableCell, { width: "12%" }]}>{asset.beneficiary ?? "—"}</Text>
            </View>
          ))}

          <View style={styles.footer}>
            <Text>Generated by Pathible — not legal advice</Text>
          </View>
        </Page>
      )}

      {/* Communications Section */}
      {sections.includes("communications") && data.communications.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Estate of {data.activation.deceasedName}</Text>
            <Text style={styles.headerSubtitle}>Communication Log</Text>
          </View>

          <View style={styles.guidanceTip}>
            <Text style={styles.guidanceTitle}>For your records</Text>
            <Text style={styles.guidanceText}>
              This log documents all communications made during estate administration. Keep this as
              part of your fiduciary duty records.
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Communications</Text>
            <Text style={styles.summaryValue}>{data.communications.length}</Text>
          </View>
          <View style={{ marginBottom: 8 }} />

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Recipient</Text>
            <Text style={[styles.tableHeaderCell, { width: "12%" }]}>Method</Text>
            <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Category</Text>
            <Text style={[styles.tableHeaderCell, { width: "42%" }]}>Subject</Text>
          </View>
          {data.communications.map((comm) => (
            <View key={`${comm.communicationDate}-${comm.recipientName}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "14%" }]}>
                {formatDate(comm.communicationDate)}
              </Text>
              <Text style={[styles.tableCell, { width: "18%" }]}>{comm.recipientName}</Text>
              <Text style={[styles.tableCell, { width: "12%" }]}>{formatLabel(comm.method)}</Text>
              <Text style={[styles.tableCell, { width: "14%" }]}>{formatLabel(comm.category)}</Text>
              <Text style={[styles.tableCell, { width: "42%" }]}>{comm.subject}</Text>
            </View>
          ))}

          <View style={styles.footer}>
            <Text>Generated by Pathible — not legal advice</Text>
          </View>
        </Page>
      )}

      {/* Distributions Section */}
      {sections.includes("distributions") && data.distributions.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Estate of {data.activation.deceasedName}</Text>
            <Text style={styles.headerSubtitle}>Distribution Summary</Text>
          </View>

          <View style={styles.guidanceTip}>
            <Text style={styles.guidanceTitle}>For your attorney and accountant</Text>
            <Text style={styles.guidanceText}>
              This summary details all distributions made from the estate. Your accountant will need
              this for estate tax returns and your attorney for final accounting.
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Distributions</Text>
            <Text style={styles.summaryValue}>{data.distributions.length}</Text>
          </View>
          {totalDistValue > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Value Distributed</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalDistValue)}</Text>
            </View>
          )}
          <View style={{ marginBottom: 8 }} />

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Beneficiary</Text>
            <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Relationship</Text>
            <Text style={[styles.tableHeaderCell, { width: "22%" }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Value</Text>
            <Text style={[styles.tableHeaderCell, { width: "16%" }]}>Method</Text>
          </View>
          {data.distributions.map((dist) => (
            <View key={`${dist.distributionDate}-${dist.beneficiaryName}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "14%" }]}>
                {formatDate(dist.distributionDate)}
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{dist.beneficiaryName}</Text>
              <Text style={[styles.tableCell, { width: "14%" }]}>
                {dist.beneficiaryRelationship ?? "—"}
              </Text>
              <Text style={[styles.tableCell, { width: "22%" }]}>{dist.description ?? "—"}</Text>
              <Text style={[styles.tableCell, { width: "14%" }]}>
                {dist.value != null ? formatCurrency(dist.value) : "—"}
              </Text>
              <Text style={[styles.tableCell, { width: "16%" }]}>{formatLabel(dist.method)}</Text>
            </View>
          ))}

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This document is a personal estate administration summary created through Pathible. It
              is not a legal document and should not replace professional legal or financial advice.
              For official estate settlement, please consult with qualified professionals.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text>Generated by Pathible — not legal advice</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
