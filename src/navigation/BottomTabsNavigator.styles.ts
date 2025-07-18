import { StyleSheet } from 'react-native';
import { scaleSize, scaleFontSize } from '../utils/responsiveDimensions';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
    backgroundColor: '#3B82F6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
  },
  menuButton: {
    padding: scaleSize(8),
  },
  titleContainer: {
    flex: 1,
  },
  notificationButton: {
    padding: scaleSize(8),
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: scaleSize(4),
    right: scaleSize(4),
    backgroundColor: '#F44336',
    borderRadius: scaleSize(10),
    minWidth: scaleSize(20),
    height: scaleSize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: scaleFontSize(12),
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: scaleSize(8),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(-2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
  },
  navigationItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleSize(8),
  },
  navigationIndicator: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(6),
    borderRadius: scaleSize(16),
    minHeight: scaleSize(32),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeNavigationIndicator: {
    backgroundColor: '#E0F2FE',
    borderRadius: scaleSize(12),
  },
  navigationLabel: {
    fontSize: scaleFontSize(10),
    color: '#49454F',
    marginTop: scaleSize(2),
    textAlign: 'center',
  },
  activeNavigationLabel: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: scaleSize(60),
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: scaleSize(16),
    marginTop: scaleSize(8),
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(8),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(16),
  },
  avatarContainer: {
    marginRight: scaleSize(12),
  },
  avatarPlaceholder: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: scaleSize(24),
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userEmailText: {
    fontSize: scaleFontSize(14),
    color: '#6B7280',
    marginTop: scaleSize(2),
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: scaleSize(8),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(8),
  },
  menuIcon: {
    marginRight: scaleSize(16),
  },
  menuText: {
    fontSize: scaleFontSize(16),
    color: '#49454F',
  },
  notificationsContainer: {
    backgroundColor: 'white',
    marginHorizontal: scaleSize(16),
    marginTop: scaleSize(8),
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    maxHeight: scaleSize(400),
    minHeight: scaleSize(300),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(8),
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scaleSize(16),
  },
  notificationsTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  centerLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSize(40),
    minHeight: scaleSize(200),
  },
  loadingText: {
    fontSize: scaleFontSize(14),
    color: '#49454F',
    marginTop: scaleSize(16),
    fontWeight: '400',
  },
  notificationsList: {
    maxHeight: scaleSize(300),
    paddingBottom: 0,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: scaleSize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotificationItem: {
    backgroundColor: '#F0F9FF',
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: scaleSize(12),
    padding: scaleSize(8),
  },
  unreadDot: {
    position: 'absolute',
    top: scaleSize(4),
    right: scaleSize(4),
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: '#3B82F6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: scaleFontSize(16),
    color: '#1F2937',
    marginBottom: scaleSize(4),
  },
  unreadNotificationTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: scaleFontSize(14),
    color: '#6B7280',
    marginBottom: scaleSize(4),
  },
  notificationTime: {
    fontSize: scaleFontSize(12),
    color: '#9CA3AF',
  },
  emptyNotifications: {
    alignItems: 'center',
    padding: scaleSize(32),
  },
  emptyNotificationsText: {
    fontSize: scaleFontSize(16),
    color: '#6B7280',
    marginTop: scaleSize(16),
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: scaleSize(48),
    paddingHorizontal: scaleSize(24),
    minHeight: scaleSize(240),
    justifyContent: 'center',
  },
  errorText: {
    fontSize: scaleFontSize(16),
    color: '#F44336',
    marginTop: scaleSize(16),
    textAlign: 'center',
    marginBottom: scaleSize(24),
    lineHeight: scaleSize(22),
    fontWeight: '400',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: scaleSize(24),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(20),
    minHeight: scaleSize(44),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  retryButtonText: {
    color: 'white',
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  loadingMoreContainer: {
    paddingVertical: scaleSize(20),
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingMoreText: {
    fontSize: scaleFontSize(14),
    color: '#6B7280',
    marginTop: scaleSize(8),
    fontStyle: 'italic',
  },
  noMoreNotificationsContainer: {
    paddingVertical: scaleSize(20),
    paddingHorizontal: scaleSize(16),
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomLeftRadius: scaleSize(12),
    borderBottomRightRadius: scaleSize(12),
  },
  noMoreNotificationsText: {
    fontSize: scaleFontSize(14),
    color: '#6B7280',
    fontStyle: 'italic',
  },
  lastNotificationItem: {
    borderBottomWidth: 0,
  },
});