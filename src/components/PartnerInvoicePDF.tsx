import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type Invoice = {
  invoiceNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  billingPeriod: string;
  messages: number;
  pricePerMessage: number;
  monthlyFee: number;
  usageAmount: number;
  totalAmount: number;
  paymentStatus: string;
  dueDate: string | null;
  createdAt: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  companyTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 12,
    color: "#666666",
  },

  invoiceNumber: {
    fontSize: 14,
    fontWeight: "bold",
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#666666",
    textTransform: "uppercase",
  },

  text: {
    marginBottom: 4,
  },

  table: {
    borderWidth: 1,
    borderColor: "#dddddd",
    marginTop: 20,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 8,
    fontWeight: "bold",
  },

  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },

  description: {
    width: "40%",
  },

  quantity: {
    width: "20%",
  },

  rate: {
    width: "20%",
  },

  amount: {
    width: "20%",
    textAlign: "right",
  },

  totals: {
    marginTop: 25,
    marginLeft: "auto",
    width: 220,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  totalLabel: {
    color: "#555555",
  },

  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#222222",
    paddingTop: 10,
    marginTop: 5,
    fontSize: 14,
    fontWeight: "bold",
  },

  status: {
    marginTop: 25,
    fontSize: 12,
    fontWeight: "bold",
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#777777",
  },
});

function formatCurrency(amount: number) {
  return `R${amount.toFixed(2)}`;
}

function formatDate(date: string | null) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString(
    "en-ZA",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

export default function PartnerInvoicePDF({
  invoice,
}: {
  invoice: Invoice;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <View style={styles.header}>

          <View>
            <Text style={styles.companyTitle}>
              Ask Michael AI
            </Text>

            <Text style={styles.subtitle}>
              Monthly Invoice
            </Text>
          </View>

          <View>
            <Text style={styles.invoiceNumber}>
              {invoice.invoiceNumber}
            </Text>

            <Text>
              {invoice.billingPeriod}
            </Text>
          </View>

        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Billed To
            </Text>

            <Text style={styles.text}>
              {invoice.companyName}
            </Text>

            <Text style={styles.text}>
              {invoice.contactName}
            </Text>

            <Text style={styles.text}>
              {invoice.email}
            </Text>

          </View>

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Invoice Details
            </Text>

            <Text style={styles.text}>
              Invoice Date:{" "}
              {formatDate(invoice.createdAt)}
            </Text>

            <Text style={styles.text}>
              Due Date:{" "}
              {formatDate(invoice.dueDate)}
            </Text>

          </View>

        </View>

        <View style={styles.table}>

          <View style={styles.tableHeader}>

            <Text style={styles.description}>
              Description
            </Text>

            <Text style={styles.quantity}>
              Quantity
            </Text>

            <Text style={styles.rate}>
              Rate
            </Text>

            <Text style={styles.amount}>
              Amount
            </Text>

          </View>

          <View style={styles.tableRow}>

            <Text style={styles.description}>
              AI Message Usage
            </Text>

            <Text style={styles.quantity}>
              {invoice.messages}
            </Text>

            <Text style={styles.rate}>
              {formatCurrency(
                invoice.pricePerMessage
              )}
            </Text>

            <Text style={styles.amount}>
              {formatCurrency(
                invoice.usageAmount
              )}
            </Text>

          </View>

          <View style={styles.tableRow}>

            <Text style={styles.description}>
              Monthly Subscription
            </Text>

            <Text style={styles.quantity}>
              1
            </Text>

            <Text style={styles.rate}>
              {formatCurrency(
                invoice.monthlyFee
              )}
            </Text>

            <Text style={styles.amount}>
              {formatCurrency(
                invoice.monthlyFee
              )}
            </Text>

          </View>

        </View>

        <View style={styles.totals}>

          <View style={styles.totalRow}>

            <Text style={styles.totalLabel}>
              Usage
            </Text>

            <Text>
              {formatCurrency(
                invoice.usageAmount
              )}
            </Text>

          </View>

          <View style={styles.totalRow}>

            <Text style={styles.totalLabel}>
              Monthly Fee
            </Text>

            <Text>
              {formatCurrency(
                invoice.monthlyFee
              )}
            </Text>

          </View>

          <View style={styles.grandTotal}>

            <Text>
              Total
            </Text>

            <Text>
              {formatCurrency(
                invoice.totalAmount
              )}
            </Text>

          </View>

        </View>

        <Text style={styles.status}>
          Payment Status:{" "}
          {invoice.paymentStatus}
        </Text>

        <Text style={styles.footer}>
          Ask Michael AI — Partner Invoice
        </Text>

      </Page>
    </Document>
  );
}