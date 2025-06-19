# Notification System Documentation

## Overview

The Elite Games application uses a custom notification system built on top of `react-hot-toast` to provide consistent, deduplicated notifications throughout the application. This system prevents duplicate notifications from appearing when multiple components or events trigger the same notification.

## Problem Solved

Previously, the application was experiencing duplicate notifications because:

1. Multiple Toaster components were being rendered in the application
2. The same notification could be triggered multiple times in quick succession
3. Component re-renders could cause notifications to be displayed again

The new notification system solves these issues by:

1. Using a singleton pattern to ensure a single source of truth
2. Implementing deduplication logic to prevent identical notifications within a short time window
3. Providing a consistent API that matches the familiar toast interface

## How to Use

### Basic Usage

```typescript
import { notify } from '@/lib/notificationManager';

// Show a success notification
notify.success('User updated successfully');

// Show an error notification
notify.error('Failed to update user');

// Show an info notification
notify.info('New feature available!');

// Show a warning notification
notify.warning('Your session will expire soon');
```

### With Options

```typescript
notify.success('User updated successfully', {
  duration: 5000, // 5 seconds
  position: 'bottom-center'
});
```

### For Backward Compatibility

If you're migrating existing code that uses `react-hot-toast` directly, you can use the compatibility layer:

```typescript
import compatToast from '@/lib/notificationManager';

// Works just like react-hot-toast
compatToast.success('User updated successfully');
compatToast.error('Failed to update user');
```

## Implementation Details

### Deduplication Logic

The notification manager uses a cache to track recently shown notifications. When a notification is triggered:

1. It creates a unique key based on the notification type and message
2. It checks if this key exists in the cache and was shown recently
3. If the notification is a duplicate within the deduplication window (default: 2 seconds), it's skipped
4. Otherwise, the notification is displayed and added to the cache

### Singleton Pattern

The notification manager uses the singleton pattern to ensure there's only one instance managing notifications:

```typescript
class NotificationManager {
  private static instance: NotificationManager;
  
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
}
```

### Cache Cleanup

To prevent memory leaks, the notification manager periodically cleans up old entries from its cache:

```typescript
private cleanupCache(): void {
  const now = Date.now();
  this.notificationCache.forEach((timestamp, key) => {
    if (now - timestamp > this.CACHE_TIMEOUT * 2) {
      this.notificationCache.delete(key);
    }
  });
}
```

## Best Practices

1. **Use the notification manager for all notifications** - Don't mix direct toast calls with the notification manager
2. **Keep messages consistent** - Use the same message text for the same events to ensure proper deduplication
3. **Use appropriate notification types** - Success, error, info, and warning notifications have different visual styles
4. **Consider notification duration** - Set appropriate durations based on the importance of the message

## Configuration

The notification system can be configured by modifying the `notificationManager.ts` file:

- `CACHE_TIMEOUT`: The time window (in milliseconds) for deduplication (default: 2000ms)
- Default toast options can be set in the `showNotification` method

## Troubleshooting

If you're still seeing duplicate notifications:

1. Check that you're not using both `react-hot-toast` directly and the notification manager
2. Ensure you've removed any duplicate `<Toaster />` components from your application
3. Verify that the message text is exactly the same for events that should be deduplicated
4. Check for components that might be mounting/unmounting frequently and triggering notifications

## Future Improvements

- Add notification queueing for high-frequency events
- Implement notification grouping for similar messages
- Add support for custom notification templates
- Create a notification context for more advanced use cases 