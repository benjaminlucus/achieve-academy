# Production Launch Checklist

## Pre-Launch

### Infrastructure
- [ ] Set up production domain and SSL certificates
- [ ] Configure production database (MongoDB Atlas recommended)
- [ ] Set up Redis instance for caching and rate limiting
- [ ] Configure Sentry for error tracking
- [ ] Set up monitoring and alerting (UptimeRobot, New Relic, Datadog, etc.)
- [ ] Configure database backups
- [ ] Set up email service (Resend configured)

### Environment
- [ ] Verify all environment variables are set
- [ ] `NODE_ENV=production`
- [ ] All API keys are production keys
- [ ] Redirect URLs are production URLs
- [ ] Clerk production instance configured

### Application
- [ ] Run full test suite
- [ ] Run `npm run build` and verify no errors
- [ ] Run `npm run typecheck` and verify no errors
- [ ] Run `npm run lint` and fix all issues
- [ ] Test all user flows manually
- [ ] Test responsive design on multiple devices
- [ ] Test accessibility
- [ ] Verify XSS protection
- [ ] Verify rate limiting
- [ ] Verify admin route protection

## Launch Day

### Deploy
- [ ] Deploy to production environment
- [ ] Verify deployment successful
- [ ] Run smoke tests on production

### Monitoring
- [ ] Monitor Sentry for errors
- [ ] Monitor application performance
- [ ] Monitor server logs
- [ ] Verify real-time features work (Pusher, LiveKit)
- [ ] Verify email delivery

### Post-Launch
- [ ] Monitor user activity
- [ ] Collect user feedback
- [ ] Update documentation
- [ ] Schedule first backup verification
