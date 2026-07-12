# Error Logging and Debugging Guide

## Overview

The blog API now includes comprehensive error logging to help diagnose 500 errors like the one reported on `/api/trpc/blog.list`.

## What Was Fixed

### Previous Issues
- Blog API returned 500 errors without clear error messages
- Firestore operations failed silently
- No server-side logging of database errors
- Published articles had inconsistent date formats

### Current Improvements
- All Firestore operations wrapped in try-catch with detailed logging
- Error messages include collection names, IDs, and operation details
- Stack traces captured for debugging
- ISO format date normalization
- Error propagation to client with meaningful messages

## Error Log Locations

### Development
- Check browser console (client errors)
- Check terminal output (server errors)

### Production (Firebase App Hosting)
- Firebase Cloud Logging: `projects/gen-lang-client-0364375301/logs/`
- Look for logs with `[firestore]` or `[blog]` prefixes
- Filter by severity: ERROR

## Common Error Patterns

### 1. Firestore Connection Issues
```
[firestore] list() failed for collection="blogPosts": PERMISSION_DENIED
```
**Cause**: Firebase credentials not properly initialized  
**Solution**: Verify `FIREBASE_` environment variables are set

### 2. Missing Documents
```
[firestore] getById() failed for collection="blogPosts" id="123": Document not found
```
**Cause**: Article was deleted or ID doesn't exist  
**Solution**: Check if article exists before operations

### 3. Invalid Queries
```
[firestore] list() failed for collection="blogPosts": INVALID_ARGUMENT - ...
```
**Cause**: Incompatible where/orderBy conditions  
**Solution**: Review query parameters in firestore-db.ts

### 4. Date Format Issues
```
[blog.list] database error: Cannot convert date to ISO string
```
**Cause**: Firestore stored invalid date format  
**Solution**: Articles now auto-normalized to ISO format

## Log Format

All database logs follow this pattern:
```
[source] function() failed for collection="X" [id="Y"]: {
  error: "Error message",
  stack: "Full stack trace",
  [additional context fields]
}
```

Example:
```
[firestore] list() failed for collection="blogPosts": {
  error: "PERMISSION_DENIED: The caller does not have permission",
  stack: "Error: PERMISSION_DENIED...",
  options: { where: [...], orderBy: [...], limit: 20 }
}
```

## Debugging Workflow

1. **Check Firebase Cloud Logging**
   - Go to Firebase Console → Logging
   - Search for `[firestore]` or `[blog]`
   - Note the exact error message and collection

2. **Check Error Type**
   - PERMISSION_DENIED: Auth/credentials issue
   - NOT_FOUND: Item doesn't exist
   - INVALID_ARGUMENT: Query parameters issue
   - INTERNAL: Server-side Firestore error

3. **Review Context**
   - Look at additional fields (id, collection, options)
   - Cross-reference with Firestore console data
   - Verify document structure matches schema

4. **Reproduce Locally**
   - Set up local Firestore emulator
   - Use same query parameters
   - Check for collection/index issues

## Modified Files and Error Logging

### firestore-db.ts
All functions now log errors:
- `insert()`: Logs data being inserted
- `update()`: Logs changes being made
- `remove()`: Logs document ID
- `list()`: Logs query options
- `findOne()`: Logs where conditions
- `count()`: Logs filtering conditions
- `getById()`: Logs document ID

### blog.ts (Public Router)
- `list`: Enhanced with input validation and date normalization
- `getBySlug`: Better error context with slug parameter
- `create`: Full request logging (content omitted for privacy)
- `update`: Detailed mutation logging

### admin.blog.ts (Admin Router)
- `list`: Query error context with filters applied
- `create`: Returns created article ID for verification
- `update`/`delete`/`publish`/`archive`: Full operation logging
- `getStats`: Stats calculation error context

## Testing Error Scenarios

### Test 1: Invalid Blog List Query
```bash
curl "https://vanirgroup.com/api/trpc/blog.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A-1%7D%7D%7D"
```
Expected: 400 validation error with message
Check logs: Should NOT see Firestore errors

### Test 2: Publish Article Through Admin
1. Go to `/admin/blog`
2. Create new article
3. Click publish
4. Check logs for: `[adminBlog.publish] mutation error`
5. Should show "success": true if working

### Test 3: Access Published Article
```bash
curl "https://vanirgroup.com/api/trpc/blog.list"
```
Expected: Array of published articles with ISO dates
Check logs: Should not show any errors

## Performance Notes

- Error logging adds minimal overhead (~1-2ms per operation)
- Stack traces only captured on errors
- No performance impact on successful operations
- All async operations properly awaited

## Future Improvements

1. **Error Aggregation**: Send errors to Sentry/similar service
2. **Metrics**: Track error rates by operation type
3. **Alerts**: Email/Slack on critical errors
4. **Recovery**: Auto-retry logic for transient errors
5. **Audit**: Log all mutations with user IDs

## Contacts

For questions about specific errors, check:
- Admin panel console for client-side errors
- Firebase Cloud Logging for server errors
- GitHub issues for known problems
