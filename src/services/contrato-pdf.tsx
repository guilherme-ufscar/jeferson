import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 150,
    fontFamily: "Helvetica-Bold",
  },
  value: {
    flex: 1,
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 60,
  },
  signatureLine: {
    width: 200,
    textAlign: "center",
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});

interface ContractPDFProps {
  contract: {
    id: string;
    startDate: string;
    endDate: string;
    monthlyValue: number;
    paymentDay: number;
    status: string;
    observacoes?: string;
    client: {
      name: string;
      cpf: string;
      rg?: string;
      phone: string;
      email?: string;
      endereco?: string;
      numero?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
      cnh?: string;
    };
    vehicle: {
      placa: string;
      marca: string;
      modelo: string;
      anoFabricacao: number;
      anoModelo: number;
      cor: string;
      chassi?: string;
      renavam?: string;
    };
  };
  companyName?: string;
  companyCnpj?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function ContractPDF({ contract, companyName, companyCnpj }: ContractPDFProps) {
  const c = contract.client;
  const v = contract.vehicle;

  const clientAddress = [c.endereco, c.numero, c.bairro, c.cidade, c.estado, c.cep]
    .filter(Boolean)
    .join(", ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{companyName || "Locadora de Veículos"}</Text>
          {companyCnpj && <Text style={styles.subtitle}>CNPJ: {companyCnpj}</Text>}
          <Text style={styles.subtitle}>CONTRATO DE LOCAÇÃO DE VEÍCULO</Text>
        </View>

        {/* Locadora (Company) Section */}
        <Text style={styles.sectionTitle}>LOCADOR</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Empresa:</Text>
          <Text style={styles.value}>{companyName || "Locadora de Veículos"}</Text>
        </View>
        {companyCnpj && (
          <View style={styles.row}>
            <Text style={styles.label}>CNPJ:</Text>
            <Text style={styles.value}>{companyCnpj}</Text>
          </View>
        )}

        {/* Client Section */}
        <Text style={styles.sectionTitle}>LOCATÁRIO</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{c.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>CPF:</Text>
          <Text style={styles.value}>{c.cpf}</Text>
        </View>
        {c.rg && (
          <View style={styles.row}>
            <Text style={styles.label}>RG:</Text>
            <Text style={styles.value}>{c.rg}</Text>
          </View>
        )}
        {c.cnh && (
          <View style={styles.row}>
            <Text style={styles.label}>CNH:</Text>
            <Text style={styles.value}>{c.cnh}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{c.phone}</Text>
        </View>
        {c.email && (
          <View style={styles.row}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.value}>{c.email}</Text>
          </View>
        )}
        {clientAddress && (
          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{clientAddress}</Text>
          </View>
        )}

        {/* Vehicle Section */}
        <Text style={styles.sectionTitle}>VEÍCULO</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Placa:</Text>
          <Text style={styles.value}>{v.placa}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Marca/Modelo:</Text>
          <Text style={styles.value}>{v.marca} {v.modelo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ano:</Text>
          <Text style={styles.value}>{v.anoFabricacao}/{v.anoModelo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cor:</Text>
          <Text style={styles.value}>{v.cor}</Text>
        </View>
        {v.chassi && (
          <View style={styles.row}>
            <Text style={styles.label}>Chassi:</Text>
            <Text style={styles.value}>{v.chassi}</Text>
          </View>
        )}
        {v.renavam && (
          <View style={styles.row}>
            <Text style={styles.label}>RENAVAM:</Text>
            <Text style={styles.value}>{v.renavam}</Text>
          </View>
        )}

        {/* Contract Terms */}
        <Text style={styles.sectionTitle}>CONDIÇÕES</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Período:</Text>
          <Text style={styles.value}>{formatDate(contract.startDate)} a {formatDate(contract.endDate)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Mensal:</Text>
          <Text style={styles.value}>{formatCurrency(contract.monthlyValue)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dia Vencimento:</Text>
          <Text style={styles.value}>Todo dia {contract.paymentDay}</Text>
        </View>

        {/* Clauses */}
        <Text style={styles.sectionTitle}>CLÁUSULAS</Text>
        <Text style={styles.paragraph}>
          1. O LOCATÁRIO se compromete a utilizar o veículo de forma adequada, responsabilizando-se por qualquer dano causado durante o período de locação.
        </Text>
        <Text style={styles.paragraph}>
          2. O LOCATÁRIO deverá devolver o veículo nas mesmas condições em que o recebeu, salvo desgaste natural de uso.
        </Text>
        <Text style={styles.paragraph}>
          3. É de responsabilidade do LOCATÁRIO o pagamento de multas de trânsito ocorridas durante o período de locação.
        </Text>
        <Text style={styles.paragraph}>
          4. O atraso no pagamento do aluguel acarretará multa de 2% sobre o valor, além de juros de 1% ao mês.
        </Text>
        <Text style={styles.paragraph}>
          5. O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 30 dias.
        </Text>

        {contract.observacoes && (
          <>
            <Text style={styles.sectionTitle}>OBSERVAÇÕES</Text>
            <Text style={styles.paragraph}>{contract.observacoes}</Text>
          </>
        )}

        {/* Signature */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureLine}>
            <View style={styles.line} />
            <Text>LOCADOR</Text>
          </View>
          <View style={styles.signatureLine}>
            <View style={styles.line} />
            <Text>LOCATÁRIO</Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>{c.name}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Contrato gerado em {new Date().toLocaleDateString("pt-BR")} | ID: {contract.id}
        </Text>
      </Page>
    </Document>
  );
}
