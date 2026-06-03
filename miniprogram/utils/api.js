const app = getApp();

const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.data.success) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

export const askAI = (question, language) => {
  return request('/ai/ask', 'POST', { question, language });
};

export const getIntermediaries = (params) => {
  return request('/intermediaries', 'GET', params);
};

export const getIntermediaryDetail = (id, language) => {
  return request(`/intermediaries/${id}`, 'GET', { language });
};

export const getReviews = (intermediaryId, language) => {
  return request('/reviews', 'GET', { intermediaryId, language });
};

export const createLead = (data) => {
  return request('/leads/create', 'POST', data);
};

export const getLeadsList = (params) => {
  return request('/leads/list', 'GET', params);
};

export const getLeadDetail = (id, params) => {
  return request(`/leads/detail/${id}`, 'GET', params);
};

export const unlockLead = (data) => {
  return request('/leads/unlock', 'POST', data);
};

export const createEscrowOrder = (data) => {
  return request('/leads/escrow/create', 'POST', data);
};

export const payEscrow = (data) => {
  return request('/leads/escrow/pay', 'POST', data);
};

export const completeService = (data) => {
  return request('/leads/escrow/complete', 'POST', data);
};

export const confirmCompletion = (data) => {
  return request('/leads/escrow/confirm', 'POST', data);
};

export const getWallet = (intermediaryId) => {
  return request('/wallet/detail', 'GET', { intermediary_id: intermediaryId });
};

export const addPoints = (data) => {
  return request('/wallet/points/add', 'POST', data);
};

export const requestRefund = (data) => {
  return request('/refund/request', 'POST', data);
};

export const approveRefund = (data) => {
  return request('/refund/approve', 'POST', data);
};

export const rejectRefund = (data) => {
  return request('/refund/reject', 'POST', data);
};

export const proposePartialRefund = (data) => {
  return request('/refund/propose-partial', 'POST', data);
};

export const acceptPartialRefund = (data) => {
  return request('/refund/accept-partial', 'POST', data);
};

export const rejectPartialRefund = (data) => {
  return request('/refund/reject-partial', 'POST', data);
};

export const submitEvidence = (data) => {
  return request('/dispute/submit-evidence', 'POST', data);
};

export const getDisputeDetail = (id) => {
  return request(`/dispute/detail/${id}`, 'GET');
};

export const arbitrate = (data) => {
  return request('/dispute/arbitrate', 'POST', data);
};

export const sendMessage = (data) => {
  return request('/messages/send', 'POST', data);
};

export const getMessages = (leadId) => {
  return request(`/messages/${leadId}`, 'GET');
};
