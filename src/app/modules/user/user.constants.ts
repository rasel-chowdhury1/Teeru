export const USER_ROLE = {
  ADMIN: 'admin',
  SEEKER: 'seeker',
  PLUSONE: 'plusone',
} as const;

export const gender = ['Male', 'Female', 'Others'] as const;
export const Role = Object.values(USER_ROLE);
