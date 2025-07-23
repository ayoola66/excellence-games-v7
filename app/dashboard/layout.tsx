export default function Layout({ children }: { children: React.ReactNode }) {
  // The root ClientLayout already provides the main dashboard layout.
  // Returning children directly prevents duplicate nested menus.
  return <>{children}</>;
}
