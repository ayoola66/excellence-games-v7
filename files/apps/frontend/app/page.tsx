import Header from '../components/Header';

export default function Home() {
  return (
    <main>
      <Header />
      <div className="p-8">
        <h1 className="text-3xl font-bold">Elite Games Trivia Platform</h1>
        <p>Welcome! Choose Admin or User portal.</p>
        <div className="flex gap-4 mt-4">
          <a href="/admin" className="btn btn-primary">Admin Portal</a>
          <a href="/user" className="btn btn-secondary">User Portal</a>
        </div>
      </div>
    </main>
  );
}