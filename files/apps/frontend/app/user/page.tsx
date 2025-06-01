import UserNav from '../../components/UserNav';

export default function UserHome() {
  return (
    <div>
      <UserNav />
      <div className="p-8">
        <h2 className="text-2xl font-bold">Play Trivia Games</h2>
        <p>Select a game category to begin!</p>
      </div>
    </div>
  );
}