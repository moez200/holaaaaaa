import { Badge, ReferralRule, Customer } from "../../../types";


export const badges: Badge[] = [
  {
    id: '1',
    name: 'Bronze',
    threshold: 5,
    discount: 5,
    icon: 'award',
    color: 'bg-amber-600',
  },
  {
    id: '2',
    name: 'Silver',
    threshold: 10,
    discount: 10,
    icon: 'award',
    color: 'bg-slate-400',
  },
  {
    id: '3',
    name: 'Gold',
    threshold: 20,
    discount: 15,
    icon: 'award',
    color: 'bg-yellow-500',
  },
  {
    id: '4',
    name: 'Platinum',
    threshold: 30,
    discount: 20,
    icon: 'award',
    color: 'bg-indigo-600',
  },
  {
    id: '5',
    name: 'Diamond',
    threshold: 50,
    discount: 25,
    icon: 'diamond',
    color: 'bg-cyan-500',
  },
];

export const referralRules: ReferralRule[] = [
  {
    id: '1',
    referralsCount: 1,
    discount: 5,
    timeFrame: '1 year',
  },
  {
    id: '2',
    referralsCount: 3,
    discount: 10,
    timeFrame: '1 year',
  },
  {
    id: '3',
    referralsCount: 5,
    discount: 15,
    timeFrame: '1 year',
  },
];

export const customers: Customer[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    orders: 12,
    referrals: 3,
    currentBadge: badges[1],
    appliedDiscounts: [
      {
        id: '1',
        name: 'Silver Badge',
        value: 10,
        appliedAt: '2023-09-15T14:30:00Z',
      },
      {
        id: '2',
        name: 'Referral Discount',
        value: 10,
        appliedAt: '2023-10-05T09:45:00Z',
      },
    ],
  },
  {
    id: '2',
    name: 'Thomas Dubois',
    email: 'thomas.dubois@example.com',
    orders: 22,
    referrals: 6,
    currentBadge: badges[2],
    appliedDiscounts: [
      {
        id: '3',
        name: 'Gold Badge',
        value: 15,
        appliedAt: '2023-08-20T11:15:00Z',
      },
      {
        id: '4',
        name: 'Referral Discount',
        value: 15,
        appliedAt: '2023-09-10T16:20:00Z',
      },
    ],
  },
  {
    id: '3',
    name: 'Emma Petit',
    email: 'emma.petit@example.com',
    orders: 4,
    referrals: 1,
    currentBadge: null,
    appliedDiscounts: [
      {
        id: '5',
        name: 'Referral Discount',
        value: 5,
        appliedAt: '2023-10-15T13:40:00Z',
      },
    ],
  },
  {
    id: '4',
    name: 'Lucas Moreau',
    email: 'lucas.moreau@example.com',
    orders: 35,
    referrals: 8,
    currentBadge: badges[3],
    appliedDiscounts: [
      {
        id: '6',
        name: 'Platinum Badge',
        value: 20,
        appliedAt: '2023-07-25T10:10:00Z',
      },
      {
        id: '7',
        name: 'Referral Discount',
        value: 15,
        appliedAt: '2023-08-30T14:50:00Z',
      },
    ],
  },
  {
    id: '5',
    name: 'Chloé Leroy',
    email: 'chloe.leroy@example.com',
    orders: 8,
    referrals: 2,
    currentBadge: badges[0],
    appliedDiscounts: [
      {
        id: '8',
        name: 'Bronze Badge',
        value: 5,
        appliedAt: '2023-09-05T15:25:00Z',
      },
      {
        id: '9',
        name: 'Referral Discount',
        value: 5,
        appliedAt: '2023-10-20T08:35:00Z',
      },
    ],
  },
];

export const notifications: Notification[] = [
  {
    id: '1',
    title: 'New Gold Badge',
    message: 'Thomas Dubois has reached Gold status with 22 orders!',
    type: 'badge',
    isRead: false,
    date: '2023-08-20T11:15:00Z',
    customerId: '2',
  },
  {
    id: '2',
    title: 'Referral Milestone',
    message: 'Lucas Moreau has referred 8 customers this year!',
    type: 'referral',
    isRead: false,
    date: '2023-08-30T14:50:00Z',
    customerId: '4',
  },
  {
    id: '3',
    title: 'New Bronze Badge',
    message: 'Chloé Leroy has reached Bronze status with 8 orders!',
    type: 'badge',
    isRead: true,
    date: '2023-09-05T15:25:00Z',
    customerId: '5',
  },
  {
    id: '4',
    title: 'New Silver Badge',
    message: 'Sophie Martin has reached Silver status with 12 orders!',
    type: 'badge',
    isRead: true,
    date: '2023-09-15T14:30:00Z',
    customerId: '1',
  },
  {
    id: '5',
    title: 'System Update',
    message: 'Loyalty system has been updated with new features.',
    type: 'system',
    isRead: false,
    date: '2023-10-01T09:00:00Z',
  },
];