import axios from 'axios'

const FLASK_URL = 'http://localhost:5001'

const flaskApi = axios.create({ baseURL: FLASK_URL })

export const fraudAPI = {
  detect: (data) => flaskApi.post('/detect', data),
  batchDetect: (transactions) => flaskApi.post('/batch-detect', { transactions }),
  stats: () => flaskApi.get('/stats'),
  health: () => flaskApi.get('/health'),
}

export default fraudAPI
