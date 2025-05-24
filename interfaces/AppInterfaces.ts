
export interface Message {
  text: string;
  sender_by: 'Bot' | 'Me';
  date: Date;
  state: 'received' | 'viewed';
}
