import AdminNav from '../../components/AdminNav';

export default function AdminHome() {
  return (
    <div>
      <AdminNav />
      <div className="p-8">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p>Manage games, users, questions, and more.</p>
      </div>
    </div>
  );
}