import Link from 'next/link';

export default function UserNav() {
  return (
    <nav className="p-4 bg-blue-800 text-white flex gap-4">
      <Link href="/user">Home</Link>
      <Link href="/user/games">Games</Link>
      <Link href="/user/music">Music</Link>
      <Link href="/user/profile">Profile</Link>
    </nav>
  );
}