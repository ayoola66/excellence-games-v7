import Link from 'next/link';

export default function AdminNav() {
  return (
    <nav className="p-4 bg-gray-800 text-white flex gap-4">
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/users">Users</Link>
      <Link href="/admin/games">Games</Link>
      <Link href="/admin/questions">Questions</Link>
      <Link href="/admin/music">Music</Link>
    </nav>
  );
}