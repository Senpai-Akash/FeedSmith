export default function NavBar() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold text-accent">FeedSmith</div>
        <ul className="flex space-x-6 text-sm font-medium">
          <li><a href="#" className="hover:text-accent transition-colors">Features</a></li>
          <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
          <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}
