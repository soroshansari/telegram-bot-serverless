import rp from 'request-promise';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

export const getShortUrl = async (longUrl: string) => {
  const options = {
    method: 'POST',
    uri: 'https://cleanuri.com/api/v1/shorten',
    form: {
      url: String(longUrl).trim(),
    },
    json: true,
  };

  return rp(options);
};

export const sendToUser = async (chat_id: string, text: string) => {
  const options = {
    method: 'GET',
    uri: `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    qs: {
      chat_id,
      text,
    },
  };

  return rp(options);
};
