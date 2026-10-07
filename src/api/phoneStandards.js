export const COUNTRY_PHONE_STANDARDS = [
  { code: '+91', name: 'India', length: 10, placeholder: '98765 43210', pattern: /^[6-9]\d{9}$/ },
  { code: '+1', name: 'USA / Canada', length: 10, placeholder: '201 555 0123', pattern: /^\d{10}$/ },
  { code: '+44', name: 'United Kingdom', length: 10, placeholder: '7700 900077', pattern: /^7\d{9}$/ },
  { code: '+61', name: 'Australia', length: 9, placeholder: '412 345 678', pattern: /^4\d{8}$/ },
  { code: '+971', name: 'UAE', length: 9, placeholder: '50 123 4567', pattern: /^5\d{8}$/ },
  { code: '+65', name: 'Singapore', length: 8, placeholder: '8123 4567', pattern: /^[89]\d{7}$/ },
  { code: '+966', name: 'Saudi Arabia', length: 9, placeholder: '50 123 4567', pattern: /^5\d{8}$/ },
  { code: '+49', name: 'Germany', length: 11, placeholder: '170 1234567', pattern: /^1[567]\d{9}$/ },
  { code: '+92', name: 'Pakistan', length: 10, placeholder: '300 1234567', pattern: /^3\d{9}$/ },
  { code: '+880', name: 'Bangladesh', length: 10, placeholder: '1712 345678', pattern: /^1[3-9]\d{8}$/ },
  { code: '+94', name: 'Sri Lanka', length: 9, placeholder: '71 234 5678', pattern: /^7[0-8]\d{7}$/ },
  { code: '+977', name: 'Nepal', length: 10, placeholder: '985 1012345', pattern: /^9[78]\d{8}$/ },
];

export function validatePhoneNumber(phone, countryCode) {
  const standard = COUNTRY_PHONE_STANDARDS.find(s => s.code === countryCode) || COUNTRY_PHONE_STANDARDS[0];
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== standard.length) {
    return `Phone number must be exactly ${standard.length} digits for ${standard.name}.`;
  }
  if (standard.pattern && !standard.pattern.test(cleaned)) {
    return `Invalid phone number format for ${standard.name}.`;
  }
  return null;
}
