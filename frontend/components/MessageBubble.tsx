import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getStatusIcon = (message: Message, isOwn: boolean): string => {
  if (!isOwn) return '';
  if (message.read) return '✓✓';
  if (message.delivered) return '✓✓';
  return '✓';
};

const getStatusColor = (message: Message): string => {
  if (message.read) return '#4FC3F7'; // Blue for read
  if (message.delivered) return '#A0A0A0'; // Grey for delivered
  return '#A0A0A0'; // Grey for sent
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const statusIcon = getStatusIcon(message, isOwn);
  const statusColor = getStatusColor(message);

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {/* Sender name — only show for received messages */}
      {!isOwn && <Text style={styles.senderName}>{message.username}</Text>}

      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
          {message.text}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
            {formatTime(message.createdAt)}
          </Text>
          {isOwn && statusIcon ? (
            <Text style={[styles.statusIcon, { color: statusColor }]}>{statusIcon}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    marginHorizontal: 12,
    maxWidth: '80%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    color: '#7B8FA1',
    fontWeight: '600',
    marginBottom: 3,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  ownBubble: {
    backgroundColor: '#6C63FF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#1E2A3A',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#E8ECF0',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.7,
  },
  ownTimestamp: {
    color: '#D0CCFF',
  },
  otherTimestamp: {
    color: '#7B8FA1',
  },
  statusIcon: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default MessageBubble;
