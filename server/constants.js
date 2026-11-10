/**
 * Promote4.me constants — shared between server modules.
 * Extracted from config.js for backwards compatibility with route modules.
 */
export const APP_URL = process.env.APP_URL || 'https://promote4.me';
export const AUTHENTIK_URL = process.env.AUTHENTIK_URL || 'https://authentik.moveweight.com';
export const AUTHENTIK_CLIENT_ID = process.env.AUTHENTIK_CLIENT_ID || 'promote4me';

export const roleRank = { user: 1, member: 2, manager: 3, admin: 4, super_admin: 5 };

export const ownerSuperAdminIds = new Set(['user-super-moveweight']);
export const ownerSuperAdminEmails = new Set(['me@moveweight.com', 'wadeivy11@gmail.com']);

export const roleCatalog = [
  { id: 'super_admin', label: 'Product Super Admin', description: 'Platform owner.' },
  { id: 'admin', label: 'Customer Admin', description: 'Company owner. Controls workspace.' },
  { id: 'manager', label: 'Manager / Lead Tech', description: 'Manages jobs, clients, team members.' },
  { id: 'member', label: 'Field Member', description: 'Technician, driver, promoter.' },
  { id: 'user', label: 'Client / Customer Viewer', description: 'Views assigned jobs and proof.' },
];

export const fieldRoleCatalog = [
  'Lead Tech', 'Dispatcher', 'Route Manager', 'Technician', 'Plumber',
  'Electrician', 'Delivery Driver', 'Flyer Team Member', 'Promoter',
  'Contractor', 'Customer Service', 'Client Viewer'
];

export const deliveryServices = [
  'Promote4.me Direct', 'Uber Eats', 'DoorDash', 'Instacart', 'Grubhub',
  'Postmates', 'Walmart Spark', 'Amazon Flex', 'Roadie', 'Shipt', 'Custom Courier'
];

export const publicPlans = [
  { id: 'free', name: 'Free Launch', price: '$0', jobs: 25, users: 3, cta: 'Start free' },
  { id: 'starter', name: 'Starter', price: '$19/mo', jobs: 250, users: 10, cta: 'Upgrade' },
  { id: 'pro', name: 'Pro', price: '$49/mo', jobs: 1500, users: 50, cta: 'Go Pro' },
  { id: 'agency', name: 'Agency', price: '$149/mo', jobs: 10000, users: 250, cta: 'Scale' },
];

export const paymentProviders = ['stripe', 'paypal', 'square', 'venmo', 'cashapp'];

export const mapProviders = [
  { id: 'openstreetmap', name: 'OpenStreetMap', apiKeyRequired: false },
  { id: 'google', name: 'Google Maps', apiKeyRequired: true },
  { id: 'mapbox', name: 'Mapbox', apiKeyRequired: true },
  { id: 'here', name: 'HERE Maps', apiKeyRequired: true },
  { id: 'bing', name: 'Bing Maps', apiKeyRequired: true },
];

export const statuses = ['Assigned', 'In Progress', 'Submitted', 'Verified', 'Rejected', 'Delivered', 'Exception'];
export const jobTypes = ['Team Promo', 'Technician On-Site', 'Plumber / Contractor', 'Food Delivery', 'Package Delivery', 'Custom Proof Job'];
export const demoUsernames = ['Test', 'TestManager', 'TestMember', 'TestClient'];
