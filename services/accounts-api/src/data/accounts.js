const ACCOUNT_ID = '3dc3d5b3-7023-4848-9853-f5400a64e80f';

const accounts = [
  {
    resourceId: ACCOUNT_ID,
    iban: 'NL91INGB0417164300',
    currency: 'EUR',
    accountType: 'Current',
    name: 'Jan de Vries',
    status: 'enabled',
  },
];

const balances = {
  [ACCOUNT_ID]: [
    {
      balanceType: 'closingBooked',
      balanceAmount: { currency: 'EUR', amount: '2450.00' },
      referenceDate: '2025-09-01',
    },
  ],
};

const transactions = {
  [ACCOUNT_ID]: {
    booked: [
      {
        transactionId: 'TX-20250901-00001',
        bookingDate: '2025-09-01',
        valueDate: '2025-09-01',
        transactionAmount: { currency: 'EUR', amount: '-85.50' },
        creditorName: 'Albert Heijn BV',
        remittanceInformationUnstructured: 'Boodschappen 01-09-2025',
      },
    ],
  },
};

module.exports = { accounts, balances, transactions };
