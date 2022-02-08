import axios from 'axios';

const { PURPUR_API_URL } = process.env;

export const purpurAxios = axios.create({
  baseURL: PURPUR_API_URL,
  url:'/v2/',
  headers: {
    'Content-Type': 'application/json',
  },
  onDownloadProgress: ev => {
    console.log(ev)
  }
});
