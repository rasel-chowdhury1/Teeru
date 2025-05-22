const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const monthNameSwitch = {
  $switch: {
    branches: MONTH_NAMES.map((name, index) => ({
      case: { $eq: ['$_id', index + 1] },
      then: name,
    })),
    default: 'Unknown',
  },
};