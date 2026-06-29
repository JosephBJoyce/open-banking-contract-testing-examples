const axios = require('axios');

class PaymentsApiClient {
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  _headers(requestId) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
    };
    if (requestId) {
      headers['x-request-id'] = requestId;
    }
    return headers;
  }

  async initiatePayment(paymentInitiation, requestId) {
    const response = await axios.post(
      `${this.baseUrl}/v1/payments/sepa-credit-transfers`,
      paymentInitiation,
      { headers: this._headers(requestId) }
    );
    return response.data;
  }

  async getPaymentStatus(paymentId, requestId) {
    const response = await axios.get(
      `${this.baseUrl}/v1/payments/sepa-credit-transfers/${paymentId}/status`,
      { headers: this._headers(requestId) }
    );
    return response.data;
  }
}

module.exports = PaymentsApiClient;
