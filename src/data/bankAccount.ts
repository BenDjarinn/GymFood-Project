export interface BankAccountData {
  account_holder: string;
  bank_account: {
    bank_name: string;
    account_number: string;
  };
  important_notes: string[];
}

const bankAccounts: BankAccountData[] = [
  {
    account_holder: "Akbar Dwi Sinaboy",
    bank_account: {
      bank_name: "BCA",
      account_number: "763123130413519",
    },
    important_notes: [
      "Ensure that the account holder name matches your account holder name",
      "Keep proof of payment for verification purposes if needed",
      "GymFood is not responsible for any loss/refund due to incorrect account number input",
    ],
  },
  {
    account_holder: "Count Sir Fatif I",
    bank_account: {
      bank_name: "BCA",
      account_number: "763123130167342",
    },
    important_notes: [
      "Ensure that the account holder name matches your account holder name",
      "Keep proof of payment for verification purposes if needed",
      "GymFood is not responsible for any loss/refund due to incorrect account number input",
    ],
  },
];

export default bankAccounts;
