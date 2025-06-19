import Link from 'next/link';
import { 
  PlayIcon, 
  QuestionMarkCircleIcon, 
  PlusCircleIcon, 
  ArrowUpTrayIcon 
} from '@heroicons/react/24/outline';

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  bgColor: string;
}

const QuickActionButton = ({ icon, title, href, bgColor }: QuickActionProps) => (
  <Link href={href} className={`flex items-center justify-between p-4 rounded-lg ${bgColor} hover:opacity-90 transition-opacity`}>
    <div className="flex items-center space-x-3">
      {icon}
      <span className="text-lg font-medium">{title}</span>
    </div>
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

export const QuickActions = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
      <QuickActionButton
        icon={<PlayIcon className="w-6 h-6" />}
        title="Manage Games"
        href="/admin/games"
        bgColor="bg-blue-50 text-blue-600"
      />
      <QuickActionButton
        icon={<QuestionMarkCircleIcon className="w-6 h-6" />}
        title="Manage Questions"
        href="/admin/questions"
        bgColor="bg-green-50 text-green-600"
      />
      <QuickActionButton
        icon={<PlusCircleIcon className="w-6 h-6" />}
        title="Manage Categories"
        href="/admin/categories"
        bgColor="bg-yellow-50 text-yellow-600"
      />
      <QuickActionButton
        icon={<ArrowUpTrayIcon className="w-6 h-6" />}
        title="Bulk Import Questions"
        href="/admin/questions/import"
        bgColor="bg-purple-50 text-purple-600"
      />
    </div>
  );
};

export default QuickActions; 