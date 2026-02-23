// Test file to verify notification helper works correctly
// This demonstrates how the buildNotificationMessage function works

const testNotification1 = {
  type: "booking_assigned",
  data: {
    farmerName: "राज कुमार",
    expertName: "डॉ. भीम सिंह",
    fieldName: "गेहूँ क्षेत्र",
    municipality: "काठमाडौं",
    ward: "5",
    nepaliDate: "२०८१/०८/१२"
  }
};

const testNotification2 = {
  type: "booking_accepted",
  data: {
    expertName: "John Smith"
  }
};

const testNotification3 = {
  type: "sample_collected",
  data: {
    expertName: "डॉ. अनिल शर्मा"
  }
};

// Example English templates (from en.json):
// notifications.bookingAssigned.message: "New booking from {{farmerName}} for {{fieldName}} at {{municipality}} ward {{ward}}. Collection date: {{nepaliDate}}"
// notifications.bookingAccepted.message: "Expert {{expertName}} has accepted your booking. They will collect the sample on the scheduled date."
// notifications.sampleCollected.message: "Expert {{expertName}} has collected your soil sample. The testing process will now begin."

// Expected outputs:
// Test 1: "New booking from राज कुमार for गेहूँ क्षेत्र at काठमाडौं ward 5. Collection date: २०८१/०८/१२"
// Test 2: "Expert John Smith has accepted your booking. They will collect the sample on the scheduled date."
// Test 3: "Expert डॉ. अनिल शर्मा has collected your soil sample. The testing process will now begin."

console.log("Notification helper test file created - use buildNotificationMessage() with these test cases");
