import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'https://promote4.me',
  authentikUrl: process.env.AUTHENTIK_URL || 'https://authentik.moveweight.com',
  authentikClientId: process.env.AUTHENTIK_CLIENT_ID || 'promote4me',
  
  plans: [
    { id: 'free', name: 'Free Launch', price: '$0', jobs: 25, users: 3, cta: 'Start free' },
    { id: 'starter', name: 'Starter', price: '$19/mo', jobs: 250, users: 10, cta: 'Upgrade' },
    { id: 'pro', name: 'Pro', price: '$49/mo', jobs: 1500, users: 50, cta: 'Go Pro' },
    { id: 'agency', name: 'Agency', price: '$149/mo', jobs: 10000, users: 250, cta: 'Scale' },
  ],
  
  paymentProviders: ['stripe', 'paypal', 'square', 'venmo', 'cashapp'],
  
  mapProviders: [
    { id: 'openstreetmap', name: 'OpenStreetMap', apiKeyRequired: false },
    { id: 'google', name: 'Google Maps', apiKeyRequired: true },
    { id: 'mapbox', name: 'Mapbox', apiKeyRequired: true },
    { id: 'here', name: 'HERE Maps', apiKeyRequired: true },
    { id: 'bing', name: 'Bing Maps', apiKeyRequired: true },
  ],
  
  deliveryServices: [
    'Promote4.me Direct', 'Uber Eats', 'DoorDash', 'Instacart', 'Grubhub',
    'Postmates', 'Walmart Spark', 'Amazon Flex', 'Roadie', 'Shipt', 'Custom Courier'
  ],
  
  fieldRoles: [
    'Lead Tech', 'Dispatcher', 'Route Manager', 'Technician', 'Plumber',
    'Electrician', 'Delivery Driver', 'Flyer Team Member', 'Promoter',
    'Contractor', 'Customer Service', 'Client Viewer'
  ],
  
  roleCatalog: [
    { id: 'super_admin', label: 'Product Super Admin', description: 'Platform owner.' },
    { id: 'admin', label: 'Customer Admin', description: 'Company owner.' },
    { id: 'manager', label: 'Manager / Lead Tech', description: 'Manages jobs, clients, team.' },
    { id: 'member', label: 'Field Member', description: 'Technician, driver, promoter.' },
    { id: 'user', label: 'Client / Customer Viewer', description: 'Views jobs and proof.' },
  ],
  
  roleRank: { user: 1, member: 2, manager: 3, admin: 4, super_admin: 5 },
  
  ownerSuperAdminIds: new Set(['user-super-moveweight']),
  ownerSuperAdminEmails: new Set(['me@moveweight.com', 'wadeivy11@gmail.com']),
  
  statuses: ['Assigned', 'In Progress', 'Submitted', 'Verified', 'Rejected', 'Delivered', 'Exception'],
  jobTypes: ['Team Promo', 'Technician On-Site', 'Plumber / Contractor', 'Food Delivery', 'Package Delivery', 'Custom Proof Job'],
  
  demoUsernames: ['Test', 'TestManager', 'TestMember', 'TestClient'],
};
