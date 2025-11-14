import { BUILD_COMPLETE, DO_UPDATE, DONE_UPDATE } from '../consts.js';

type MessageType = typeof DO_UPDATE | typeof DONE_UPDATE | typeof BUILD_COMPLETE;

interface UpdateMessage {
  type: typeof DO_UPDATE | typeof DONE_UPDATE;
  id?: string;
}

interface BuildCompleteMessage {
  type: typeof BUILD_COMPLETE;
  id: string;
}

type Message = UpdateMessage | BuildCompleteMessage;

export default {
  send: (message: Message): string => {
    return JSON.stringify(message);
  },
  receive: (rawMessage: string): Message => {
    const message = JSON.parse(rawMessage) as Message;
    return message;
  },
};