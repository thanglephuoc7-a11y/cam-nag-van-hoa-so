
import type { User } from '../types';

// Using 'let' to allow modification for registration and password reset simulation.
export let users: User[] = [
  { name: 'An Nguyen', password: '1234', lang: 'vi', joinDate: '2025-10-20T10:00:00Z', lastLogin: '2025-10-29T20:15:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=annguyen', bio: 'Học sinh lớp 11, yêu thích công nghệ và muốn tìm hiểu về an toàn mạng.' },
  { name: 'John Pham', password: '5678', lang: 'en', joinDate: '2025-10-22T15:30:00Z', lastLogin: '2025-10-29T20:30:00Z', avatarUrl: 'https://i.pravatar.cc/150?u=johnpham', bio: '12th grade student, passionate about graphic design and digital art.' },
];