const axios = require('axios');

class AccountsApiClient {
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

  async getAccounts(requestId) {
    const response = await axios.get(`${this.baseUrl}/v3/accounts`, {
      headers: this._headers(requestId),
    });
    return response.data;
  }

  async getBalances(accountId, requestId) {
    const response = await axios.get(
      `${this.baseUrl}/v3/accounts/${accountId}/balances`,
      { headers: this._headers(requestId) }
    );
    return response.data;
  }

  async getTransactions(accountId, requestId) {
    const response = await axios.get(
      `${this.baseUrl}/v3/accounts/${accountId}/transactions`,
      { headers: this._headers(requestId) }
    );
    return response.data;
  }
}

module.exports = AccountsApiClient;
