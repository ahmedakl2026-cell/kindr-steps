import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Star, Moon, Sun, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "الرئيسية", path: "/" },
  { label: "ركن الأطفال", path: "/kids" },
  { label: "مكتبة الإعاقات", path: "/library" },
  { label: "المتخصصون", path: "/specialists" },
  { label: "لوحة الأهل", path: "/parent-dashboard", requireAuth: true },
  { label: "مجتمع الدعم", path: "/community", requireAuth: true },
  { label: "الرسائل", path: "/messages", requireAuth: true },
  { label: "فريق العمل", path: "/team" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const visibleLinks = navLinks.filter((link) => {
    if (link.requireAuth && !user) return false;
    if ((link as any).requireRole && (link as any).requireRole !== role) return false;
    return true;
  });

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">خطوة</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{profile?.full_name}</span>
              <Button variant="outline" className="rounded-xl gap-2" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                خروج
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="btn-bounce rounded-xl">تسجيل الدخول</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2">
          {visibleLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            {user ? (
              <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                <LogOut className="w-4 h-4" />
                خروج
              </Button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">تسجيل الدخول</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
