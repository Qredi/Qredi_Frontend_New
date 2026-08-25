export interface Application {
  id: string;
  merchantName: string;
  businessType: string;
  creditScore: number;
  riskLevel: "Low" | "Medium" | "High";
  fraudRisk: "Low" | "Moderate" | "Elevated";
  requestedAmount: string;
  submittedAt: string;
}

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "QRD-00124",
    merchantName: "Kedai Nusantara",
    businessType: "Food & Beverage",
    creditScore: 86,
    riskLevel: "Low",
    fraudRisk: "Low",
    requestedAmount: "Rp 50.000.000",
    submittedAt: "2 minutes ago",
  },
  {
    id: "QRD-00125",
    merchantName: "Toko Kelontong Berkah",
    businessType: "Retail",
    creditScore: 72,
    riskLevel: "Medium",
    fraudRisk: "Low",
    requestedAmount: "Rp 25.000.000",
    submittedAt: "15 minutes ago",
  },
  {
    id: "QRD-00126",
    merchantName: "Apotek Sehat Gemilang",
    businessType: "Healthcare",
    creditScore: 91,
    riskLevel: "Low",
    fraudRisk: "Low",
    requestedAmount: "Rp 120.000.000",
    submittedAt: "1 hour ago",
  },
  {
    id: "QRD-00127",
    merchantName: "Warung Kopi Senja",
    businessType: "Food & Beverage",
    creditScore: 43,
    riskLevel: "High",
    fraudRisk: "Elevated",
    requestedAmount: "Rp 15.000.000",
    submittedAt: "3 hours ago",
  },
  {
    id: "QRD-00128",
    merchantName: "Bengkel Jaya Abadi",
    businessType: "Automotive",
    creditScore: 61,
    riskLevel: "Medium",
    fraudRisk: "Moderate",
    requestedAmount: "Rp 80.000.000",
    submittedAt: "5 hours ago",
  },
  {
    id: "QRD-00129",
    merchantName: "Fashion Hijab Chic",
    businessType: "Apparel",
    creditScore: 78,
    riskLevel: "Low",
    fraudRisk: "Low",
    requestedAmount: "Rp 45.000.000",
    submittedAt: "1 day ago",
  },
];
