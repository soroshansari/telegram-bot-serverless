import { getShortUrl, sendToUser } from '../../services/telegram.service';
import { CustomAPIGatewayProxyEvent } from '../../utils/lambda-router';

export const ShortBot = async (event: CustomAPIGatewayProxyEvent) => {
  const { chat, text } = event.body.message;

  if (text) {
    let message = '';
    try {
      const result = await getShortUrl(text);
      message = `Input: ${text}, \nShort: ${result.result_url}`;
    } catch (error) {
      message = `Input: ${text}, \nError: ${error.message}`;
    }

    await sendToUser(chat.id, message);
  } else {
    await sendToUser(chat.id, 'Text message is expected.');
  }

  return { statusCode: 200 };
};
