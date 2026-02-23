/**
 * Builds a fully translated notification message by interpolating template with data
 * @param {string} notificationType - The notification type (e.g., 'booking_assigned')
 * @param {object} notificationData - The data object from notification ({farmerName, expertName, fieldName, municipality, ward, nepaliDate})
 * @param {function} t - i18n translation function
 * @returns {object} - Object with title and message properties
 */
export const buildNotificationMessage = (
  notificationType,
  notificationData,
  t
) => {
  // Map notification types to translation keys
  const typeToKeyMap = {
    booking_assigned: "notifications.bookingAssigned",
    booking_accepted: "notifications.bookingAccepted",
    booking_rejected: "notifications.bookingRejected",
    booking_reassigned: "notifications.bookingReassigned",
    sample_collected: "notifications.sampleCollected",
    report_uploaded: "notifications.reportUploaded",
    booking_completed: "notifications.bookingCompleted",
  };

  const baseKey = typeToKeyMap[notificationType];

  if (!baseKey) {
    return {
      title: "Notification",
      message: "New notification received",
    };
  }

  // Get the template strings
  const titleTemplate = t(`${baseKey}.title`);
  const messageTemplate = t(`${baseKey}.message`);

  // Interpolate data into templates
  const interpolatedTitle = interpolateString(titleTemplate, notificationData);
  const interpolatedMessage = interpolateString(messageTemplate, notificationData);

  return {
    title: interpolatedTitle,
    message: interpolatedMessage,
  };
};

/**
 * Interpolates template string with data object
 * Replaces {{key}} with values from data object
 * @param {string} template - Template string with {{placeholder}} syntax
 * @param {object} data - Data object to interpolate
 * @returns {string} - Interpolated string
 */
const interpolateString = (template, data = {}) => {
  if (!template) return "";

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
};
